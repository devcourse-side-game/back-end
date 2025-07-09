import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PartyMember } from '../entities/party-members.entity';
import { Party } from '../entities/party.entity';
import { User } from '../../users/entities/user.entity';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { MemberListResponseDto, PartyMemberDetailDto } from '../dto/response.dto';
import { UserGameProfilesService } from '../../user-game-profiles/services/user-game-profiles.service';
import { JoinPartyDto } from '../dto/join-party.dto';
import { UserGameProfile } from 'src/user-game-profiles/entities/user-game-profile.entity';

@Injectable()
export class PartyMembersService {
	constructor(
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		private readonly userGameProfilesService: UserGameProfilesService,
		private readonly dataSource: DataSource,
	) {}

	async joinParty(
		partyId: number,
		userId: number,
		dto: JoinPartyDto,
	): Promise<{ username: string }> {
		return this.dataSource.transaction(async (manager) => {
			const party = await manager
				.createQueryBuilder(Party, 'party')
				.where('party.id = :partyId', { partyId })
				.setLock('pessimistic_write')
				.getOne();

			if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

			if (party.isPrivate && (!dto.accessCode || party.accessCode !== dto.accessCode)) {
				throw new AppException(ErrorCode.PARTY_INVALID_ACCESS_CODE);
			}

			const existingMember = await manager.findOne(PartyMember, {
				where: { partyId, userId },
			});
			if (existingMember) throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);

			const currentCount = await manager.count(PartyMember, { where: { partyId } });
			if (currentCount >= party.maxParticipants) {
				throw new AppException(ErrorCode.PARTY_MAX_PARTICIPANTS);
			}

			const user = await manager.findOne(User, { where: { id: userId } });
			if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND);

			let userGameProfile: UserGameProfile | null;
			if (dto.profileId) {
				userGameProfile = await this.userGameProfilesService.getUserGameProfileById(
					dto.profileId,
					userId,
					party.gameId,
				);
				if (!userGameProfile) {
					throw new AppException(
						ErrorCode.USER_GAME_PROFILE_NOT_FOUND,
						'선택한 게임 프로필이 존재하지 않습니다.',
					);
				}
			} else if (dto.gameUsername) {
				userGameProfile = await this.userGameProfilesService.findOrCreateUserGameProfile(
					userId,
					party.gameId,
					dto.gameUsername,
				);
			} else {
				throw new AppException(
					ErrorCode.VALIDATION_ERROR,
					'게임 프로필 정보(profileId 또는 gameUsername)가 필요합니다.',
				);
			}

			const newMember = manager.create(PartyMember, {
				partyId,
				userId,
				userGameProfileId: userGameProfile.id,
			});
			await manager.save(newMember);

			return { username: user.username };
		});
	}

	async leaveParty(partyId: number, userId: number): Promise<{ username: string }> {
		return this.dataSource.transaction(async (manager) => {
			const member = await manager.findOne(PartyMember, {
				where: { partyId, userId },
				relations: ['user'],
			});
			if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);
			if (member.isLeader) throw new AppException(ErrorCode.PARTY_LEADER_CANNOT_LEAVE);

			await manager.remove(member);
			return { username: member.user.username };
		});
	}

	async getPartyMembers(partyId: number): Promise<MemberListResponseDto> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		const members = await this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});

		const profileIdList = members
			.map((m) => m.userGameProfileId)
			.filter((id): id is number => !!id);

		const profileMap = new Map<number, string>();
		if (profileIdList.length > 0) {
			const profiles = await this.userGameProfilesService.getProfilesByIds(profileIdList);
			profiles.forEach((p) => profileMap.set(p.id, p.gameUsername));
		}

		const memberDtos: PartyMemberDetailDto[] = members.map((member) => ({
			id: member.id,
			userId: member.userId,
			username: member.user?.username || '',
			isLeader: member.isLeader,
			joinedAt: member.joinedAt?.toISOString(),
			gameUsername:
				member.userGameProfileId && profileMap.has(member.userGameProfileId)
					? profileMap.get(member.userGameProfileId)!
					: '',
		}));

		return {
			members: memberDtos,
			partyId: party.id,
			partyTitle: party.title,
		};
	}

	async kickMember(
		partyId: number,
		leaderId: number,
		userIdToKick: number,
	): Promise<{ username: string }> {
		return this.dataSource.transaction(async (manager) => {
			if (leaderId === userIdToKick) {
				throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
			}

			const leader = await manager.findOne(PartyMember, {
				where: { partyId, userId: leaderId },
			});
			if (!leader || !leader.isLeader) throw new AppException(ErrorCode.PARTY_NOT_LEADER);

			const memberToKick = await manager.findOne(PartyMember, {
				where: { partyId, userId: userIdToKick },
				relations: ['user'],
			});
			if (!memberToKick) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

			await manager.remove(memberToKick);
			return { username: memberToKick.user.username };
		});
	}

	async changeLeader(
		partyId: number,
		currentLeaderId: number,
		newLeaderId: number,
	): Promise<{ username: string }> {
		return this.dataSource.transaction(async (manager) => {
			if (currentLeaderId === newLeaderId) {
				throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
			}

			const currentLeader = await manager.findOne(PartyMember, {
				where: { partyId, userId: currentLeaderId },
			});
			if (!currentLeader || !currentLeader.isLeader) {
				throw new AppException(ErrorCode.PARTY_NOT_LEADER);
			}

			const newLeader = await manager.findOne(PartyMember, {
				where: { partyId, userId: newLeaderId },
				relations: ['user'],
			});
			if (!newLeader) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

			currentLeader.isLeader = false;
			newLeader.isLeader = true;
			await manager.save([currentLeader, newLeader]);

			return { username: newLeader.user.username };
		});
	}
}
