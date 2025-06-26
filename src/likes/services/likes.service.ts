import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class LikesService {
	constructor(
		@InjectRepository(Like)
		private likesRepository: Repository<Like>,
		private usersService: UsersService,
	) {}

	/**
	 * 좋아요 추가
	 */
	async addLike(givenUserId: number, receivedUserId: number): Promise<void> {
		// 자기 자신에게 좋아요를 추가하려는 경우 예외 처리
		if (givenUserId === receivedUserId) {
			throw new BadRequestException('자신에게 좋아요를 추가할 수 없습니다.');
		}

		// 받는 사용자가 존재하는지 확인
		const receivedUser = await this.usersService.findById(receivedUserId);
		if (!receivedUser) {
			throw new NotFoundException('받는 사용자를 찾을 수 없습니다.');
		}

		// 이미 좋아요를 추가했는지 확인
		const existingLike = await this.likesRepository.findOne({
			where: {
				givenUserId,
				receivedUserId,
			},
		});

		if (existingLike) {
			throw new ConflictException('이미 좋아요를 추가했습니다.');
		}

		// 좋아요 추가
		const like = this.likesRepository.create({
			givenUserId,
			receivedUserId,
		});

		await this.likesRepository.save(like);
	}

	/**
	 * 좋아요 취소
	 */
	async removeLike(givenUserId: number, receivedUserId: number): Promise<void> {
		// 자기 자신의 좋아요를 취소하려는 경우 예외 처리
		if (givenUserId === receivedUserId) {
			throw new BadRequestException('자신에게 좋아요를 추가할 수 없습니다.');
		}

		// 받는 사용자가 존재하는지 확인
		const receivedUser = await this.usersService.findById(receivedUserId);
		if (!receivedUser) {
			throw new NotFoundException('받는 사용자를 찾을 수 없습니다.');
		}

		// 좋아요가 존재하는지 확인
		const like = await this.likesRepository.findOne({
			where: {
				givenUserId,
				receivedUserId,
			},
		});

		if (!like) {
			throw new NotFoundException('좋아요를 찾을 수 없습니다.');
		}

		// 좋아요 취소
		await this.likesRepository.remove(like);
	}

	/**
	 * 좋아요 상태 확인
	 */
	async checkLikeStatus(givenUserId: number, checkedUserId: number): Promise<boolean> {
		// 체크하려는 사용자가 존재하는지 확인
		const checkedUser = await this.usersService.findById(checkedUserId);
		if (!checkedUser) {
			throw new NotFoundException('체크하려는 사용자를 찾을 수 없습니다.');
		}

		// 좋아요 상태 확인
		const like = await this.likesRepository.findOne({
			where: {
				givenUserId,
				receivedUserId: checkedUserId,
			},
		});

		return !!like;
	}

	/**
	 * 여러 사용자의 좋아요 상태 일괄 확인
	 */
	async checkBatchLikeStatus(
		givenUserId: number,
		checkedUserIds: number[],
	): Promise<{ [userId: number]: boolean }> {
		// 중복 제거 및 유효한 ID만 필터링
		const uniqueUserIds = [...new Set(checkedUserIds)].filter((id) => !isNaN(id));

		if (uniqueUserIds.length === 0) {
			return {};
		}

		// 한 번의 쿼리로 모든 좋아요 관계 조회
		const likes = await this.likesRepository.find({
			where: {
				givenUserId,
				receivedUserId: In(uniqueUserIds),
			},
		});

		// 결과 매핑
		const result: Record<number, boolean> = {};
		uniqueUserIds.forEach((userId) => {
			result[userId] = likes.some((like) => like.receivedUserId === userId);
		});

		return result;
	}
}
