import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyMember } from '../entities/party-members.entity';
import { Party } from '../entities/party.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PartyMembersService {
	constructor(
		@InjectRepository(PartyMember)
		private readonly partyMemberRepository: Repository<PartyMember>,
		@InjectRepository(Party)
		private readonly partyRepository: Repository<Party>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async joinParty(partyId: number, userId: number): Promise<void> {
		const party = await this.partyRepository.findOne({ where: { id: partyId } });
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
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
	}

	async leaveParty(partyId: number, userId: number): Promise<void> {
		const member = await this.partyMemberRepository.findOne({
			where: { partyId, userId },
		});
		if (!member) throw new NotFoundException('파티에 참가하지 않았습니다.');
		await this.partyMemberRepository.remove(member);
	}

	async getPartyMembers(partyId: number): Promise<PartyMember[]> {
		return this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});
	}

	async joinPrivateParty(partyId: number, userId: number, accessCode: string): Promise<void> {
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
	}

	async kickMember(partyId: number, leaderId: number, userId: number): Promise<void> {
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
	}

	async changeLeader(partyId: number, leaderId: number, newLeaderId: number): Promise<void> {
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
	}
}
