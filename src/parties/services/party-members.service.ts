import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PartyMember } from '../entities/party-members.entity';
import { Party } from '../entities/party.entity';
import { User } from '../../users/entities/user.entity';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { Game } from '../../games/entities/game.entity';
import { MemberListResponseDto, PartyMemberDetailDto } from '../dto/response.dto';
import { UserGameProfilesService } from '../../user-game-profiles/services/user-game-profiles.service';
import { JoinPartyDto } from '../dto/join-party.dto';

@Injectable()
export class PartyMembersService {
	constructor(
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly userGameProfilesService: UserGameProfilesService,
		private readonly dataSource: DataSource,
	) {}

	async joinParty(
		partyId: number,
		userId: number,
		dto: JoinPartyDto,
	): Promise<{ username: string }> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// FOR UPDATE로 파티 행에 배타적 잠금 설정 (동시성 제어)
			const party = await queryRunner.manager
				.createQueryBuilder(Party, 'party')
				.where('party.id = :partyId', { partyId })
				.setLock('pessimistic_write') // FOR UPDATE
				.getOne();

			if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

			// 비공개 파티는 접근 코드 검증
			if (party.isPrivate) {
				if (!dto.accessCode || party.accessCode !== dto.accessCode) {
					throw new AppException(ErrorCode.PARTY_INVALID_ACCESS_CODE);
				}
			}

			// 이미 참가한 사용자인지 확인 (중복 참가 방지)
			const exists = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId },
			});
			if (exists) throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);

			// 현재 멤버 수 체크 (FOR UPDATE로 잠긴 상태에서 정확한 count)
			const currentCount = await queryRunner.manager.count(PartyMember, {
				where: { partyId },
			});
			if (currentCount >= party.maxParticipants) {
				throw new AppException(ErrorCode.PARTY_MAX_PARTICIPANTS);
			}

			const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
			if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND);

			const game = await queryRunner.manager.findOne(Game, { where: { id: party.gameId } });
			if (!game) throw new AppException(ErrorCode.GAME_NOT_FOUND);

			// UserGameProfile 조회/생성
			let userGameProfile: { id: number } | null = null;
			if (dto.profileId) {
				const profile = await this.userGameProfilesService.getUserGameProfileById(
					dto.profileId,
					userId,
					party.gameId,
				);
				if (!profile) {
					throw new AppException(
						ErrorCode.USER_GAME_PROFILE_NOT_FOUND,
						'선택한 게임 프로필이 존재하지 않습니다.',
					);
				}
				userGameProfile = { id: profile.id };
			} else if (dto.gameUsername) {
				const profile = await this.userGameProfilesService.findOrCreateUserGameProfile(
					userId,
					party.gameId,
					dto.gameUsername,
				);
				userGameProfile = { id: profile.id };
			} else {
				// DTO에서 이미 검증하지만, 서비스 계층에서도 방어적으로 확인
				throw new AppException(
					ErrorCode.VALIDATION_ERROR,
					'게임 프로필 정보(profileId 또는 gameUsername)가 필요합니다.',
				);
			}

			const newMember = this.partyMemberRepository.create({
				partyId,
				userId,
				userGameProfileId: userGameProfile?.id,
			});
			await queryRunner.manager.save(newMember);

			await queryRunner.commitTransaction();
			return { username: user.username };
		} catch (error: unknown) {
			await queryRunner.rollbackTransaction();
			if (error instanceof AppException) throw error;
			// DB 제약 조건 위반 (중복 참가) 처리
			if (error instanceof Error && error.message.includes('Duplicate entry')) {
				throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);
			}
			throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
		} finally {
			await queryRunner.release();
		}
	}

	async leaveParty(partyId: number, userId: number): Promise<{ username: string }> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const member = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId },
				relations: ['user'],
			});
			if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

			// 파티장은 탈퇴할 수 없음
			if (member.isLeader) {
				throw new AppException(ErrorCode.PARTY_LEADER_CANNOT_LEAVE);
			}

			await queryRunner.manager.remove(member);
			await queryRunner.commitTransaction();

			return { username: member.user?.username || '' };
		} catch (error: unknown) {
			await queryRunner.rollbackTransaction();
			if (error instanceof AppException) throw error;
			throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
		} finally {
			await queryRunner.release();
		}
	}

	async getPartyMembers(partyId: number): Promise<MemberListResponseDto> {
		const members = await this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});

		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		// userGameProfileId가 있는 멤버들의 프로필을 한 번에 조회
		const profileIdList = members
			.map((m) => m.userGameProfileId)
			.filter((id): id is number => !!id);
		let profileMap: Map<number, string> = new Map();
		if (profileIdList.length > 0) {
			const profiles = await this.userGameProfilesService.getProfilesByIds(profileIdList);
			profileMap = new Map(profiles.map((p) => [p.id, p.gameUsername]));
		}

		const memberDtos: PartyMemberDetailDto[] = members.map((member) => {
			let gameUsername = '';
			if (member.userGameProfileId) {
				gameUsername = profileMap.get(member.userGameProfileId) || '';
			}
			// fallback: userGameProfileId가 없거나, 매칭되는 프로필이 없는 경우
			if (!gameUsername) {
				gameUsername = '';
			}
			return {
				id: member.id,
				userId: member.userId,
				username: member.user?.username || '',
				isLeader: member.isLeader,
				joinedAt: member.joinedAt?.toISOString(),
				userGameProfile: { gameUsername },
			};
		});

		return {
			members: memberDtos,
			partyId: party.id,
			partyTitle: party.title,
		};
	}

	async kickMember(
		partyId: number,
		leaderId: number,
		userId: number,
	): Promise<{ username: string }> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const party = await queryRunner.manager.findOne(Party, { where: { id: partyId } });
			if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

			// 자기 자신을 강퇴할 수 없음
			if (leaderId === userId) {
				throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
			}

			const leader = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId: leaderId },
			});
			if (!leader || !leader.isLeader) throw new AppException(ErrorCode.PARTY_NOT_LEADER);

			const member = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId },
				relations: ['user'],
			});
			if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

			await queryRunner.manager.remove(member);
			await queryRunner.commitTransaction();

			return { username: member.user?.username || '' };
		} catch (error: unknown) {
			await queryRunner.rollbackTransaction();
			if (error instanceof AppException) throw error;
			throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
		} finally {
			await queryRunner.release();
		}
	}

	async changeLeader(
		partyId: number,
		leaderId: number,
		newLeaderId: number,
	): Promise<{ username: string }> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const party = await queryRunner.manager.findOne(Party, { where: { id: partyId } });
			if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

			// 자기 자신에게 권한을 이양할 수 없음
			if (leaderId === newLeaderId) {
				throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
			}

			const leader = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId: leaderId },
			});
			if (!leader || !leader.isLeader) throw new AppException(ErrorCode.PARTY_NOT_LEADER);

			const newLeader = await queryRunner.manager.findOne(PartyMember, {
				where: { partyId, userId: newLeaderId },
				relations: ['user'],
			});
			if (!newLeader) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

			leader.isLeader = false;
			newLeader.isLeader = true;
			await queryRunner.manager.save([leader, newLeader]);
			await queryRunner.commitTransaction();

			return { username: newLeader.user?.username || '' };
		} catch (error: unknown) {
			await queryRunner.rollbackTransaction();
			if (error instanceof AppException) throw error;
			throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
		} finally {
			await queryRunner.release();
		}
	}
}
