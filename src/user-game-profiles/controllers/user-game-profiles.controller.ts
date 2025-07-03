import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserGameProfilesService } from '../services/user-game-profiles.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserGameProfileDto } from '../dto/user-game-profile.dto';

@ApiTags('userGameProfiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/game-profiles')
export class UserGameProfilesController {
	constructor(private readonly userGameProfilesService: UserGameProfilesService) {}

	@ApiOperation({ summary: '특정 사용자의 모든 게임 프로필 조회' })
	@ApiResponse({
		status: 200,
		description: '사용자의 게임 프로필 목록',
		type: [UserGameProfileDto],
	})
	@ApiResponse({
		status: 404,
		description: '프로필 없음',
		schema: {
			example: {
				errorCode: 'ugp-001',
				message: '사용자 게임 프로필을 찾을 수 없습니다.',
				detail: '해당 사용자의 게임 프로필이 존재하지 않습니다.',
				timestamp: '2025-07-02T12:00:00.000Z',
				path: '/users/1/game-profiles/999',
			},
		},
	})
	@ApiParam({ name: 'userId', description: '사용자 ID', type: 'number' })
	@Get()
	async getUserGameProfiles(
		@Param('userId', ParseIntPipe) userId: number,
	): Promise<UserGameProfileDto[]> {
		return this.userGameProfilesService.getUserGameProfiles(userId);
	}

	@ApiOperation({ summary: '특정 사용자의 특정 게임에 대한 모든 프로필 조회' })
	@ApiResponse({
		status: 200,
		description: '사용자의 특정 게임에 대한 프로필 목록',
		type: [UserGameProfileDto],
	})
	@ApiResponse({
		status: 404,
		description: '프로필 없음',
		schema: {
			example: {
				errorCode: 'ugp-001',
				message: '사용자 게임 프로필을 찾을 수 없습니다.',
				detail: '해당 사용자의 게임 프로필이 존재하지 않습니다.',
				timestamp: '2025-07-02T12:00:00.000Z',
				path: '/users/1/game-profiles/999',
			},
		},
	})
	@ApiParam({ name: 'userId', description: '사용자 ID', type: 'number' })
	@ApiParam({ name: 'gameId', description: '게임 ID', type: 'number' })
	@Get(':gameId')
	async getUserGameProfilesByGame(
		@Param('userId', ParseIntPipe) userId: number,
		@Param('gameId', ParseIntPipe) gameId: number,
	): Promise<UserGameProfileDto[]> {
		return this.userGameProfilesService.getUserGameProfilesByGame(userId, gameId);
	}
}
