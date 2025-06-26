import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LikesService } from '../services/likes.service';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import {
	LikeResponseDto,
	LikeStatusResponseDto,
	LikeErrorResponseDto,
	LikeNotFoundResponseDto,
	LikeAlreadyExistsResponseDto,
	BatchLikeStatusResponseDto,
} from '../dto/like-response.dto';
import { Like } from 'typeorm';

@ApiTags('likes')
@Controller('api/users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class LikesController {
	constructor(private readonly likesService: LikesService) {}

	@Post(':userId/like')
	@ApiOperation({ summary: '좋아요 추가', description: '유저에게 좋아요 추가' })
	@ApiParam({ name: 'userId', description: '좋아요를 받을 사용자 ID' })
	@ApiResponse({
		status: 201,
		description: '좋아요 추가 성공',
		type: LikeResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: '잘못된 요청 (자신에게 좋아요를 추가하려는 경우 등)',
		type: LikeErrorResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: '받는 사용자를 찾을 수 없습니다.',
		type: LikeNotFoundResponseDto,
	})
	@ApiResponse({
		status: 409,
		description: '이미 좋아요를 추가했습니다.',
		type: LikeAlreadyExistsResponseDto,
	})
	async addLike(@GetUser() jwtPayload: JwtPayload, @Param('userId') receivedUserId: string) {
		await this.likesService.addLike(jwtPayload.id, parseInt(receivedUserId));
		return { message: '좋아요를 추가했습니다.' };
	}

	@Delete(':userId/like')
	@ApiOperation({ summary: '좋아요 취소', description: '유저 좋아요 취소' })
	@ApiParam({ name: 'userId', description: '좋아요를 취소할 사용자 ID' })
	@ApiResponse({
		status: 200,
		description: '좋아요 취소 성공',
		type: LikeResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: '취소하려는 사용자를 찾을 수 없습니다.',
		type: LikeNotFoundResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: '좋아요를 찾을 수 없음',
		type: LikeNotFoundResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: '잘못된 요청 (자신에게 좋아요를 추가하려는 경우 등)',
		type: LikeErrorResponseDto,
	})
	async removeLike(@GetUser() jwtPayload: JwtPayload, @Param('userId') receivedUserId: string) {
		await this.likesService.removeLike(jwtPayload.id, parseInt(receivedUserId));
		return { message: '좋아요를 취소했습니다.' };
	}

	@Get(':userId/like')
	@ApiOperation({ summary: '좋아요 상태 확인', description: '사용자의 좋아요 상태 확인' })
	@ApiParam({ name: 'userId', description: '좋아요 상태를 확인할 사용자 ID' })
	@ApiResponse({
		status: 200,
		description: '좋아요 상태 확인 성공',
		type: LikeStatusResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: '체크하려는 사용자를 찾을 수 없습니다.',
		type: LikeNotFoundResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: '좋아요를 찾을 수 없음',
		type: LikeNotFoundResponseDto,
	})
	async checkLikeStatus(
		@GetUser() jwtPayload: JwtPayload,
		@Param('userId') checkedUserId: string,
	) {
		const liked = await this.likesService.checkLikeStatus(
			jwtPayload.id,
			parseInt(checkedUserId),
		);
		return { liked };
	}

	@Get('batch-like')
	@ApiOperation({
		summary: '여러 사용자 좋아요 상태 일괄 확인',
		description: '여러 사용자에 대한 좋아요 상태를 한 번에 확인',
	})
	@ApiQuery({
		name: 'userIds',
		description: '좋아요 상태를 확인할 사용자 ID 목록 (쉼표로 구분)',
		required: true,
	})
	@ApiResponse({
		status: 200,
		description: '좋아요 상태 확인 성공',
		type: BatchLikeStatusResponseDto,
	})
	async checkBatchLikeStatus(
		@GetUser() jwtPayload: JwtPayload,
		@Query('userIds') userIdsString: string,
	) {
		const userIds = userIdsString.split(',').map((id) => parseInt(id));
		return this.likesService.checkBatchLikeStatus(jwtPayload.id, userIds);
	}
}
