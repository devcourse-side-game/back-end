import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Party } from '../entities/party.entity';
import { UserGameProfile } from '../entities/user-game-profile.entity';
import { Game } from '../../games/entities/game.entity';
import { User } from '../../users/entities/user.entity';
import { PartyMember } from '../entities/party-members.entity';
import { CreatePartyDto } from '../dto/create-party.dto';
import { UpdatePartyDto } from '../dto/update-party.dto';

@Injectable()
export class PartiesService {
	constructor(
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		@InjectRepository(UserGameProfile)
		private readonly userGameProfileRepository: Repository<UserGameProfile>,
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		private readonly dataSource: DataSource,
	) {}

	/**
	 * 파티 생성
	 */
	async createParty(dto: CreatePartyDto, creatorId: number): Promise<Party> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const game = await queryRunner.manager.findOneBy(Game, { id: dto.gameId });
			if (!game) throw new AppException(ErrorCode.GAME_NOT_FOUND);

			const creator = await queryRunner.manager.findOneBy(User, { id: creatorId });
			if (!creator) throw new AppException(ErrorCode.USER_NOT_FOUND);

			let userGameProfile = await queryRunner.manager.findOne(UserGameProfile, {
				where: { user: { id: creatorId }, game: { id: dto.gameId } },
			});
			if (!userGameProfile) {
				userGameProfile = queryRunner.manager.create(UserGameProfile, {
					user: creator,
					game: game,
					game_username: creator.username,
				});
				await queryRunner.manager.save(userGameProfile);
			}

			if (dto.isPrivate && !dto.accessCode) {
				throw new AppException(ErrorCode.VALIDATION_ERROR);
			}

			const party = queryRunner.manager.create(Party, {
				title: dto.title,
				gameId: dto.gameId,
				creatorId: creatorId,
				purposeTag: dto.purposeTag,
				maxParticipants: dto.maxParticipants,
				description: dto.description,
				isPrivate: dto.isPrivate ?? false,
				accessCode: dto.accessCode,
				isCompleted: false,
			});
			const newParty = await queryRunner.manager.save(party);

			const partyMember = queryRunner.manager.create(PartyMember, {
				partyId: newParty.id,
				userId: creatorId,
				isLeader: true,
			});
			await queryRunner.manager.save(partyMember);

			await queryRunner.commitTransaction();
			return newParty;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			if (error instanceof AppException) throw error;
			throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
		} finally {
			await queryRunner.release();
		}
	}

	/**
	 * 파티 ID로 파티 조회 (DTO 변환)
	 */
	async findPartyById(
		id: number,
	): Promise<import('../dto/party-with-members.dto').PartyWithMembersDto> {
		const party = await this.partyRepository.findOne({
			where: { id },
			relations: ['creator', 'game', 'members', 'members.user'],
		});
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);
		return this.toPartyWithMembersDto(party);
	}

	/**
	 * Party 엔티티를 PartyWithMembersDto로 변환 (password 등 민감 정보 제거)
	 */
	toPartyWithMembersDto(
		party: Party,
	): import('../dto/party-with-members.dto').PartyWithMembersDto {
		const {
			id,
			title,
			gameId,
			creatorId,
			purposeTag,
			maxParticipants,
			description,
			isPrivate,
			accessCode,
			isCompleted,
			createdAt,
			updatedAt,
			creator,
			members,
		} = party;
		return {
			id,
			title,
			gameId,
			creatorId,
			purposeTag,
			maxParticipants,
			description,
			isPrivate,
			accessCode,
			isCompleted,
			createdAt,
			updatedAt,
			creator: creator
				? {
						id: creator.id,
						username: creator.username,
						email: creator.email,
						profileImage: creator.profileImage,
					}
				: { id: 0, username: '', email: '', profileImage: '' },
			members: (members || []).map((m) => ({
				id: m.id,
				userId: m.userId,
				username: m.user?.username ?? '',
				isLeader: m.isLeader,
				joinedAt: m.joinedAt,
				leftAt: m.leftAt,
			})),
		};
	}

	/**
	 * 파티 정보 수정
	 */
	async updateParty(partyId: number, dto: UpdatePartyDto, userId: number): Promise<Party> {
		const party = await this.findPartyById(partyId);
		if (party.creatorId !== userId) {
			throw new AppException(ErrorCode.PARTY_NOT_CREATOR);
		}
		Object.assign(party, {
			title: dto.title ?? party.title,
			purposeTag: dto.purposeTag ?? party.purposeTag,
			maxParticipants: dto.maxParticipants ?? party.maxParticipants,
			description: dto.description ?? party.description,
			isPrivate: dto.isPrivate ?? party.isPrivate,
			accessCode: dto.accessCode ?? party.accessCode,
		});
		return this.partyRepository.save(party);
	}

	/**
	 * 파티 삭제
	 */
	async deleteParty(partyId: number, userId: number): Promise<void> {
		// Party 엔티티로 조회해야 remove가 정상 동작
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);
		if (party.creatorId !== userId) {
			throw new AppException(ErrorCode.PARTY_NOT_CREATOR);
		}
		await this.partyRepository.remove(party);
	}

	async listParties(query: {
		gameId?: number;
		isCompleted?: boolean;
		isPrivate?: boolean;
		page?: number;
		limit?: number;
	}): Promise<import('../dto/response.dto').PartyListItemDto[]> {
		// relations: game, members, members.user, members.userGameProfile
		const qb = this.partyRepository
			.createQueryBuilder('party')
			.leftJoinAndSelect('party.game', 'game')
			.leftJoinAndSelect('party.members', 'members')
			.leftJoinAndSelect('members.user', 'user');
		if (query.gameId) qb.andWhere('party.gameId = :gameId', { gameId: query.gameId });
		if (query.isCompleted !== undefined)
			qb.andWhere('party.isCompleted = :isCompleted', { isCompleted: query.isCompleted });
		if (query.isPrivate !== undefined)
			qb.andWhere('party.isPrivate = :isPrivate', { isPrivate: query.isPrivate });
		qb.orderBy('party.createdAt', 'DESC');
		qb.skip(((query.page ?? 1) - 1) * (query.limit ?? 20)).take(query.limit ?? 20);
		const parties = await qb.getMany();

		// 각 파티별 리더, 멤버 수, 게임 배너, 리더의 게임네임 포함 변환
		return Promise.all(
			parties.map(async (party) => {
				const leader = party.members.find((m) => m.isLeader);
				let leaderGameUsername = '';
				if (leader && leader.user) {
					// 리더의 게임 프로필 조회
					const userGameProfile = await this.userGameProfileRepository.findOne({
						where: { user: { id: leader.user.id }, game: { id: party.gameId } },
					});
					leaderGameUsername = userGameProfile?.game_username || '';
				}
				const dto: import('../dto/response.dto').PartyListItemDto = {
					id: party.id,
					title: party.title,
					gameId: party.gameId,
					gameBannerUrl: party.game?.bannerUrl || '',
					creatorId: party.creatorId,
					purposeTag: party.purposeTag,
					maxParticipants: party.maxParticipants,
					description: party.description,
					isPrivate: party.isPrivate,
					accessCode: party.accessCode,
					isCompleted: party.isCompleted,
					createdAt: party.createdAt,
					updatedAt: party.updatedAt,
					leader:
						leader && leader.user
							? {
									userId: leader.user.id,
									username: leader.user.username,
									gameUsername: leaderGameUsername,
								}
							: null,
					currentMemberCount: party.members.length,
				};
				return dto;
			}),
		);
	}

	async joinParty(partyId: number, userId: number): Promise<void> {
		const exists = await this.partyMemberRepository.findOne({ where: { partyId, userId } });
		if (exists) throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);
		const member = this.partyMemberRepository.create({ partyId, userId, isLeader: false });
		await this.partyMemberRepository.save(member);
	}

	async leaveParty(partyId: number, userId: number): Promise<void> {
		const member = await this.partyMemberRepository.findOne({ where: { partyId, userId } });
		if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);
		await this.partyMemberRepository.remove(member);
	}

	async getPartyMembers(partyId: number): Promise<PartyMember[]> {
		return this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});
	}

	/**
	 * 파티 완료 처리
	 */
	async completeParty(partyId: number, userId: number): Promise<void> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);
		if (party.creatorId !== userId) {
			throw new AppException(ErrorCode.PARTY_NOT_CREATOR);
		}
		if (party.isCompleted) {
			throw new AppException(ErrorCode.PARTY_ALREADY_COMPLETED);
		}
		party.isCompleted = true;
		await this.partyRepository.save(party);
	}
}
