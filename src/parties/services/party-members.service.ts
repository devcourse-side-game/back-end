import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyMember } from '../entities/party-members.entity';
import { Party } from '../entities/party.entity';
import { User } from '../../users/entities/user.entity';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { UserGameProfile } from '../entities/user-game-profile.entity';
import { MemberListResponseDto, PartyMemberDto } from '../dto/response.dto';

@Injectable()
export class PartyMembersService {
	constructor(
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserGameProfile)
		private readonly userGameProfileRepository: Repository<UserGameProfile>,
	) {}

	async joinParty(partyId: number, userId: number): Promise<{ username: string }> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		// 현재 멤버 수 체크
		const currentCount = await this.partyMemberRepository.count({ where: { partyId } });
		if (currentCount >= party.maxParticipants) {
			throw new AppException(ErrorCode.PARTY_MAX_PARTICIPANTS);
		}

		let userGameProfile = await this.userGameProfileRepository.findOne({
			where: {
				user: { id: userId },
				game: { id: party.gameId },
			},
		});
		if (!userGameProfile) {
			// 유저 정보 조회
			const user = await this.userRepository.findOne({ where: { id: userId } });
			if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND);
			// 게임 정보 조회
			const game = await this.partyRepository.manager
				.getRepository('Game')
				.findOne({ where: { id: party.gameId } });
			if (!game) throw new AppException(ErrorCode.GAME_NOT_FOUND);
			// UserGameProfile 자동 생성 (username 사용)
			userGameProfile = this.userGameProfileRepository.create({
				user,
				game,
				game_username: user.username,
			});
			await this.userGameProfileRepository.save(userGameProfile);
		}

		const exists = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (exists) throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);

		const member = this.partyMemberRepository.create({
			partyId,
			userId,
			isLeader: false,
		});
		await this.partyMemberRepository.save(member);
		const user = await this.userRepository.findOne({ where: { id: userId } });
		return { username: user?.username || '' };
	}

	async leaveParty(partyId: number, userId: number): Promise<{ username: string }> {
		const member = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);

		// 파티장은 탈퇴할 수 없음
		if (member.isLeader) {
			throw new AppException(ErrorCode.PARTY_LEADER_CANNOT_LEAVE);
		}

		await this.partyMemberRepository.remove(member);
		const user = await this.userRepository.findOne({ where: { id: userId } });
		return { username: user?.username || '' };
	}

	async getPartyMembers(partyId: number): Promise<MemberListResponseDto> {
		const members = await this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});

		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		const memberDtos: PartyMemberDto[] = await Promise.all(
			members.map(async (member) => {
				const userGameProfile = await this.userGameProfileRepository.findOne({
					where: {
						user: { id: member.userId },
						game: { id: party.gameId },
					},
				});
				return {
					id: member.id,
					userId: member.userId,
					username: member.user?.username || '',
					isLeader: member.isLeader,
					joinedAt: member.joinedAt?.toISOString(),
					userGameProfile: userGameProfile
						? { gameUsername: userGameProfile.game_username }
						: { gameUsername: '' },
				};
			}),
		);

		return {
			members: memberDtos,
			partyId: party.id,
			partyTitle: party.title,
		};
	}

	async joinPrivateParty(
		partyId: number,
		userId: number,
		accessCode: string,
	): Promise<{ username: string }> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);
		if (!party.isPrivate) throw new AppException(ErrorCode.VALIDATION_ERROR);
		if (party.accessCode !== accessCode)
			throw new AppException(ErrorCode.PARTY_INVALID_ACCESS_CODE);

		// 현재 멤버 수 체크
		const currentCount = await this.partyMemberRepository.count({ where: { partyId } });
		if (currentCount >= party.maxParticipants) {
			throw new AppException(ErrorCode.PARTY_MAX_PARTICIPANTS);
		}

		const exists = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (exists) throw new AppException(ErrorCode.PARTY_ALREADY_JOINED);
		const member = this.partyMemberRepository.create({
			partyId,
			userId,
			isLeader: false,
		});
		await this.partyMemberRepository.save(member);
		const user = await this.userRepository.findOne({ where: { id: userId } });
		return { username: user?.username || '' };
	}

	async kickMember(
		partyId: number,
		leaderId: number,
		userId: number,
	): Promise<{ username: string }> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		// 자기 자신을 강퇴할 수 없음
		if (leaderId === userId) {
			throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
		}

		const leader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: leaderId },
		});
		if (!leader || !leader.isLeader) throw new AppException(ErrorCode.PARTY_NOT_LEADER);
		const member = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (!member) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);
		await this.partyMemberRepository.remove(member);
		const user = await this.userRepository.findOne({ where: { id: userId } });
		return { username: user?.username || '' };
	}

	async changeLeader(
		partyId: number,
		leaderId: number,
		newLeaderId: number,
	): Promise<{ username: string }> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new AppException(ErrorCode.PARTY_NOT_FOUND);

		// 자기 자신에게 권한을 이양할 수 없음
		if (leaderId === newLeaderId) {
			throw new AppException(ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED);
		}

		const leader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: leaderId },
		});
		if (!leader || !leader.isLeader) throw new AppException(ErrorCode.PARTY_NOT_LEADER);
		const newLeader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: newLeaderId },
		});
		if (!newLeader) throw new AppException(ErrorCode.PARTY_MEMBER_NOT_FOUND);
		leader.isLeader = false;
		newLeader.isLeader = true;
		await this.partyMemberRepository.save([leader, newLeader]);
		const user = await this.userRepository.findOne({ where: { id: newLeaderId } });
		return { username: user?.username || '' };
	}
}
