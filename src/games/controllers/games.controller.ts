import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Game } from '../entities/game.entity';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@ApiTags('games')
@Controller('games')
export class GamesController {
	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
	) {}

	@ApiOperation({ summary: '게임 목록 조회' })
	@ApiQuery({
		name: 'platform',
		required: false,
		description: '플랫폼 필터 (steam, riot, blizzard, custom)',
	})
	@ApiQuery({ name: 'isActive', required: false, description: '활성화 여부', type: Boolean })
	@ApiQuery({ name: 'limit', required: false, description: '최대 조회 개수', type: Number })
	@ApiQuery({
		name: 'page',
		required: false,
		description: '페이지 번호(1부터 시작)',
		type: Number,
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: '게임명, 슬러그, Steam App ID로 검색',
	})
	@ApiResponse({ status: 200, description: '게임 목록', type: [Game] })
	@Get()
	async getGames(
		@Query('platform') platform?: string,
		@Query('isActive') isActive?: boolean,
		@Query('limit') limit = 20,
		@Query('page') page = 1,
		@Query('search') search?: string,
	) {
		const where: import('typeorm').FindOptionsWhere<Game> = {};
		if (platform) where.platforms = platform as Game['platforms'];
		if (isActive !== undefined) where.isActive = isActive;

		const take = Math.min(Number(limit) || 20, 100);
		const skip = Number(page) > 1 ? (Number(page) - 1) * take : 0;

		if (search) {
			const searchNum = Number(search);
			const or: import('typeorm').FindOptionsWhere<Game>[] = [
				{ name: Like(`%${search}%`) },
				{ slug: Like(`%${search}%`) },
			];
			if (!isNaN(searchNum)) {
				or.push({ steamAppId: searchNum });
			}
			return this.gameRepository.find({
				take,
				skip,
				where: or,
			});
		}

		return this.gameRepository.find({ where, take, skip });
	}

	@ApiOperation({ summary: '게임 ID로 특정 게임 조회' })
	@ApiParam({ name: 'id', description: '게임 ID', type: Number })
	@ApiResponse({ status: 200, description: '게임 정보', type: Game })
	@ApiResponse({
		status: 404,
		description: '게임을 찾을 수 없음',
		schema: {
			example: {
				errorCode: 'gm-001',
				message: '게임을 찾을 수 없습니다.',
				detail: '존재하지 않는 게임입니다.',
				timestamp: '2025-07-01T12:00:00.000Z',
				path: '/games/999',
			},
		},
	})
	@Get(':id')
	async getGameById(@Param('id', ParseIntPipe) id: number) {
		const game = await this.gameRepository.findOne({ where: { id } });
		if (!game) {
			throw new AppException(ErrorCode.GAME_NOT_FOUND);
		}
		return game;
	}
}
