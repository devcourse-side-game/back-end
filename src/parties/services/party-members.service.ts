import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
		if (!party) throw new AppException(ErrorCode.VALIDATION_ERROR, '파티가 존재하지 않습니다.');

		// 현재 멤버 수 체크
		const currentCount = await this.partyMemberRepository.count({ where: { partyId } });
		if (currentCount >= party.maxParticipants) {
			throw new AppException(
				ErrorCode.VALIDATION_ERROR,
				'파티 최대 인원을 초과하여 참가할 수 없습니다.',
			);
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
			if (!user)
				throw new AppException(ErrorCode.VALIDATION_ERROR, '유저가 존재하지 않습니다.');
			// 게임 정보 조회
			const game = await this.partyRepository.manager
				.getRepository('Game')
				.findOne({ where: { id: party.gameId } });
			if (!game)
				throw new AppException(ErrorCode.VALIDATION_ERROR, '게임이 존재하지 않습니다.');
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
		if (exists) throw new AppException(ErrorCode.VALIDATION_ERROR, '이미 참가한 파티입니다.');

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
		if (!member) throw new NotFoundException('파티에 참가하지 않았습니다.');
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
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');

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
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
		if (!party.isPrivate) throw new BadRequestException('비공개 파티가 아닙니다.');
		if (party.accessCode !== accessCode)
			throw new BadRequestException('접근 코드가 올바르지 않습니다.');
		const exists = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (exists) throw new BadRequestException('이미 참가한 파티입니다.');
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
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
		const leader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: leaderId },
		});
		if (!leader || !leader.isLeader)
			throw new BadRequestException('파티장만 강퇴할 수 있습니다.');
		const member = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (!member) throw new NotFoundException('해당 파티원을 찾을 수 없습니다.');
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
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
		const leader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: leaderId },
		});
		if (!leader || !leader.isLeader)
			throw new BadRequestException('파티장만 리더를 변경할 수 있습니다.');
		const newLeader = await this.partyMemberRepository.findOne({
			where: { partyId, userId: newLeaderId },
		});
		if (!newLeader) throw new NotFoundException('새 파티원을 찾을 수 없습니다.');
		leader.isLeader = false;
		newLeader.isLeader = true;
		await this.partyMemberRepository.save([leader, newLeader]);
		const user = await this.userRepository.findOne({ where: { id: newLeaderId } });
		return { username: user?.username || '' };
	}
}
