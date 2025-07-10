import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { Party } from '../entities/party.entity';
import { Game } from '../../games/entities/game.entity';
import { User } from '../../users/entities/user.entity';
import { PartyMember } from '../entities/party-members.entity';
import { CreatePartyDto } from '../dto/create-party.dto';
import { UpdatePartyDto } from '../dto/update-party.dto';
import { PartyWithMembersDto } from '../dto/party-with-members.dto';
import { UserGameProfilesService } from '../../user-game-profiles/services/user-game-profiles.service';
import { PartyListItemDto } from '../dto/response.dto';
import { UserGameProfile } from 'src/user-game-profiles/entities/user-game-profile.entity';

@Injectable()
export class PartiesService {
	constructor(
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		private readonly userGameProfilesService: UserGameProfilesService,
		private readonly dataSource: DataSource,
	) {}

	async createParty(dto: CreatePartyDto, creatorId: number): Promise<PartyWithMembersDto> {
		return this.dataSource.transaction(async (manager) => {
			const game = await manager.findOneBy(Game, { id: dto.gameId });
			if (!game) throw new AppException(ErrorCode.GAME_NOT_FOUND);

			const creator = await manager.findOneBy(User, { id: creatorId });
			if (!creator) throw new AppException(ErrorCode.USER_NOT_FOUND);

			let userGameProfile: UserGameProfile | null;
			if (dto.profileId) {
				userGameProfile = await this.userGameProfilesService.getUserGameProfileById(
					dto.profileId,
					creatorId,
					dto.gameId,
				);
				if (!userGameProfile) {
					throw new AppException(
						ErrorCode.USER_GAME_PROFILE_NOT_FOUND,
						'선택한 게임 프로필이 존재하지 않습니다.',
					);
				}
			} else if (dto.gameUsername) {
				userGameProfile = await this.userGameProfilesService.findOrCreateUserGameProfile(
					creatorId,
					dto.gameId,
					dto.gameUsername,
				);
			} else {
				throw new AppException(
					ErrorCode.VALIDATION_ERROR,
					'게임 프로필 정보(profileId 또는 gameUsername)가 필요합니다.',
				);
			}

			if (dto.isPrivate && !dto.accessCode) {
				throw new AppException(
					ErrorCode.VALIDATION_ERROR,
					'비공개 파티는 참여 코드가 필요합니다.',
				);
			}

			const party = manager.create(Party, {
				...dto,
				creatorId,
				accessCode: dto.isPrivate ? dto.accessCode : undefined,
				isCompleted: false,
			});
			const newParty = await manager.save(party);

			const partyMember = manager.create(PartyMember, {
				partyId: newParty.id,
				userId: creatorId,
				isLeader: true,
				userGameProfileId: userGameProfile.id,
			});
			await manager.save(partyMember);

			const createdParty = await manager.findOne(Party, {
				where: { id: newParty.id },
				relations: ['game', 'members', 'members.user'],
			});

			if (!createdParty) {
				throw new AppException(
					ErrorCode.PARTY_NOT_FOUND,
					'파티 생성 후 조회에 실패했습니다.',
				);
			}

			const userGameProfilesMap = new Map<number, string>();
			if (userGameProfile?.id && userGameProfile?.gameUsername) {
				userGameProfilesMap.set(userGameProfile.id, userGameProfile.gameUsername);
			}

			return this.toPartyWithMembersDto(createdParty, userGameProfilesMap);
		});
	}

	async findPartyById(id: number): Promise<PartyWithMembersDto> {
		const party = await this.partyRepository.findOne({
			where: { id },
			relations: ['game', 'members', 'members.user'],
		});
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		const profileIds = (party.members || [])
			.map((m) => m.userGameProfileId)
			.filter((id) => id) as number[];
		const profiles = await this.userGameProfilesService.getProfilesByIds(profileIds);
		const userGameProfilesMap = new Map(profiles.map((p) => [p.id, p.gameUsername]));

		return this.toPartyWithMembersDto(party, userGameProfilesMap);
	}

	toPartyWithMembersDto(
		party: Party,
		userGameProfilesMap?: Map<number, string>,
	): PartyWithMembersDto {
		const { members, creatorId, ...partyDetails } = party;
		const leader = members?.find((m) => m.isLeader);
		const leaderGameUsername = leader?.userGameProfileId
			? (userGameProfilesMap?.get(leader.userGameProfileId) ?? '')
			: '';

		return {
			...partyDetails,
			leaderId: leader?.userId ?? 0,
			leader:
				leader && leader.user
					? {
							userId: leader.user.id,
							username: leader.user.username,
							gameUsername: leaderGameUsername,
						}
					: null,
			members: (members || []).map((m) => ({
				id: m.id,
				userId: m.userId,
				username: m.user?.username ?? '',
				isLeader: m.isLeader,
				joinedAt: m.joinedAt,
				leftAt: m.leftAt,
				gameUsername: m.userGameProfileId
					? (userGameProfilesMap?.get(m.userGameProfileId) ?? '')
					: '',
			})),
		};
	}

	async updateParty(
		partyId: number,
		dto: UpdatePartyDto,
		userId: number,
	): Promise<PartyWithMembersDto> {
		return this.dataSource.transaction(async (manager) => {
			const party = await manager.findOne(Party, {
				where: { id: partyId },
				relations: ['game', 'members', 'members.user'],
			});

			if (!party) {
				throw new AppException(ErrorCode.PARTY_NOT_FOUND);
			}
			if (party.creatorId !== userId) {
				throw new AppException(ErrorCode.FORBIDDEN, '파티를 수정할 권한이 없습니다.');
			}

			if (dto.profileId) {
				const profile = await this.userGameProfilesService.getUserGameProfileById(
					dto.profileId,
					userId,
					party.gameId,
				);
				if (!profile) {
					throw new AppException(
						ErrorCode.USER_GAME_PROFILE_NOT_FOUND,
						'선택한 게임 프로필이 유효하지 않습니다.',
					);
				}
				// 현재 사용자(파티 생성자)의 파티 멤버 프로필도 업데이트
				await manager.update(
					PartyMember,
					{ partyId, userId },
					{ userGameProfileId: profile.id },
				);
			} else if (dto.gameUsername) {
				const profile = await this.userGameProfilesService.findOrCreateUserGameProfile(
					userId,
					party.gameId,
					dto.gameUsername,
				);
				// 현재 사용자(파티 생성자)의 파티 멤버 프로필도 업데이트
				await manager.update(
					PartyMember,
					{ partyId, userId },
					{ userGameProfileId: profile.id },
				);
			}

			Object.assign(party, {
				...dto,
				accessCode: dto.isPrivate === true ? dto.accessCode : undefined,
			});

			if (party.isPrivate && !party.accessCode) {
				throw new AppException(
					ErrorCode.VALIDATION_ERROR,
					'비공개 파티는 참여 코드가 필요합니다.',
				);
			}

			const updatedPartyEntity = await manager.save(party);

			const profileIds = (updatedPartyEntity.members || [])
				.map((m) => m.userGameProfileId)
				.filter((id) => id) as number[];
			const profiles = await this.userGameProfilesService.getProfilesByIds(profileIds);
			const userGameProfilesMap = new Map(profiles.map((p) => [p.id, p.gameUsername]));

			return this.toPartyWithMembersDto(updatedPartyEntity, userGameProfilesMap);
		});
	}

	async deleteParty(partyId: number, userId: number): Promise<void> {
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
	}): Promise<PartyListItemDto[]> {
		const { gameId, isCompleted, isPrivate, page = 1, limit = 20 } = query;
		const where: FindOptionsWhere<Party> = {};

		if (gameId) where.gameId = gameId;
		if (isCompleted !== undefined) where.isCompleted = isCompleted;
		if (isPrivate !== undefined) where.isPrivate = isPrivate;

		const parties = await this.partyRepository.find({
			where,
			relations: ['game', 'members', 'members.user'],
			order: { createdAt: 'DESC' },
			skip: (page - 1) * limit,
			take: limit,
		});

		const leaderInfos = parties
			.map((party) => {
				const leader = party.members.find((m) => m.isLeader);
				return leader ? { userId: leader.userId, gameId: party.gameId } : null;
			})
			.filter((info): info is { userId: number; gameId: number } => info !== null);

		const userGameProfilesMap =
			await this.userGameProfilesService.getGameProfilesForUsers(leaderInfos);

		return parties.map((party) => {
			const leader = party.members.find((m) => m.isLeader);
			const leaderGameUsername =
				leader && leader.user
					? userGameProfilesMap.get(`${leader.userId}-${party.gameId}`) || ''
					: '';

			return {
				id: party.id,
				title: party.title,
				gameId: party.gameId,
				gameBannerUrl: party.game?.bannerUrl || '',
				leaderId: leader?.userId ?? 0,
				purposeTag: party.purposeTag,
				maxParticipants: party.maxParticipants,
				description: party.description,
				isPrivate: party.isPrivate,
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
		});
	}

	async findUserParties(
		userId: number,
		query: {
			isCompleted?: boolean;
			isPrivate?: boolean;
			page?: number;
			limit?: number;
		},
	): Promise<PartyListItemDto[]> {
		const { isCompleted, isPrivate, page = 1, limit = 20 } = query;

		const userPartyMemberships = await this.partyMemberRepository.find({
			where: { userId },
			select: ['partyId'],
		});

		if (userPartyMemberships.length === 0) {
			return [];
		}

		const partyIds = userPartyMemberships.map((m) => m.partyId);

		const where: FindOptionsWhere<Party> = { id: In(partyIds) };
		if (isCompleted !== undefined) where.isCompleted = isCompleted;
		if (isPrivate !== undefined) where.isPrivate = isPrivate;

		const parties = await this.partyRepository.find({
			where,
			relations: ['game', 'members', 'members.user'],
			order: { createdAt: 'DESC' },
			skip: (page - 1) * limit,
			take: limit,
		});

		const leaderInfos = parties
			.map((party) => {
				const leader = party.members.find((m) => m.isLeader);
				return leader ? { userId: leader.userId, gameId: party.gameId } : null;
			})
			.filter((info): info is { userId: number; gameId: number } => info !== null);

		const userGameProfilesMap =
			await this.userGameProfilesService.getGameProfilesForUsers(leaderInfos);

		return parties.map((party) => {
			const leader = party.members.find((m) => m.isLeader);
			const leaderGameUsername =
				leader && leader.user
					? userGameProfilesMap.get(`${leader.userId}-${party.gameId}`) || ''
					: '';

			return {
				id: party.id,
				title: party.title,
				gameId: party.gameId,
				gameBannerUrl: party.game?.bannerUrl || '',
				leaderId: leader?.userId ?? 0,
				purposeTag: party.purposeTag,
				maxParticipants: party.maxParticipants,
				description: party.description,
				isPrivate: party.isPrivate,
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
		});
	}

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
