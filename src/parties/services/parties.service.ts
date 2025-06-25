import {
	BadRequestException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
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
			if (!game) throw new NotFoundException('존재하지 않는 게임입니다.');

			const creator = await queryRunner.manager.findOneBy(User, { id: creatorId });
			if (!creator) throw new NotFoundException('존재하지 않는 사용자입니다.');

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
				throw new BadRequestException('비공개 파티는 참여 코드가 필요합니다.');
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
			if (error instanceof Error) throw error;
			throw new BadRequestException('파티 생성 중 알 수 없는 오류가 발생했습니다.');
		} finally {
			await queryRunner.release();
		}
	}

	/**
	 * 파티 ID로 파티 조회
	 */
	async findPartyById(id: number): Promise<Party> {
		const party = await this.partyRepository.findOne({
			where: { id },
			relations: ['creator', 'game', 'members', 'members.user'],
		});
		if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
		return party;
	}

	/**
	 * 파티 정보 수정
	 */
	async updateParty(partyId: number, dto: UpdatePartyDto, userId: number): Promise<Party> {
		const party = await this.findPartyById(partyId);
		if (party.creatorId !== userId) {
			throw new ForbiddenException('파티 생성자만 수정할 수 있습니다.');
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
		const party = await this.findPartyById(partyId);
		if (party.creatorId !== userId) {
			throw new ForbiddenException('파티 생성자만 삭제할 수 있습니다.');
		}
		await this.partyRepository.remove(party);
	}

	async listParties(query: {
		gameId?: number;
		isCompleted?: boolean;
		isPrivate?: boolean;
		page?: number;
		limit?: number;
	}): Promise<Party[]> {
		const qb = this.partyRepository.createQueryBuilder('party');
		if (query.gameId) qb.andWhere('party.gameId = :gameId', { gameId: query.gameId });
		if (query.isCompleted !== undefined)
			qb.andWhere('party.isCompleted = :isCompleted', { isCompleted: query.isCompleted });
		if (query.isPrivate !== undefined)
			qb.andWhere('party.isPrivate = :isPrivate', { isPrivate: query.isPrivate });
		qb.orderBy('party.createdAt', 'DESC');
		qb.skip(((query.page ?? 1) - 1) * (query.limit ?? 20)).take(query.limit ?? 20);
		return qb.getMany();
	}

	async joinParty(partyId: number, userId: number): Promise<void> {
		const exists = await this.partyMemberRepository.findOne({ where: { partyId, userId } });
		if (exists) throw new BadRequestException('이미 참가한 파티입니다.');
		const member = this.partyMemberRepository.create({ partyId, userId, isLeader: false });
		await this.partyMemberRepository.save(member);
	}

	async leaveParty(partyId: number, userId: number): Promise<void> {
		const member = await this.partyMemberRepository.findOne({ where: { partyId, userId } });
		if (!member) throw new NotFoundException('파티에 참가하지 않았습니다.');
		await this.partyMemberRepository.remove(member);
	}

	async getPartyMembers(partyId: number): Promise<PartyMember[]> {
		return this.partyMemberRepository.find({
			where: { partyId },
			relations: ['user'],
		});
	}
}
