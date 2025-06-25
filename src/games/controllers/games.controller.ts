import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Game } from '../entities/game.entity';

@ApiTags('games')
@Controller('api/games')
export class GamesController {
	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
	) {}

	@ApiOperation({ summary: '게임 목록 조회' })
	@ApiQuery({ name: 'platform', required: false, description: '플랫폼 필터 (steam, riot, blizzard, custom)' })
	@ApiQuery({ name: 'isActive', required: false, description: '활성화 여부', type: Boolean })
	@ApiQuery({ name: 'limit', required: false, description: '최대 조회 개수', type: Number })
	@ApiQuery({ name: 'page', required: false, description: '페이지 번호(1부터 시작)', type: Number })
	@ApiQuery({ name: 'search', required: false, description: '게임명, 슬러그, Steam App ID로 검색' })
	@ApiResponse({ status: 200, description: '게임 목록', type: [Game] })
	@Get()
	async getGames(
		@Query('platform') platform?: string,
		@Query('isActive') isActive?: boolean,
		@Query('limit') limit = 20,
		@Query('page') page = 1,
		@Query('search') search?: string,
	) {
		const where: any = {};
		if (platform) where.platforms = platform;
		if (isActive !== undefined) where.isActive = isActive;

		if (search) {
			const searchNum = Number(search);
			where['OR'] = [
				{ name: Like(`%${search}%`) },
				{ slug: Like(`%${search}%`) },
			];
			if (!isNaN(searchNum)) {
				where['OR'].push({ steamAppId: searchNum });
			}
		}

		const take = Math.min(Number(limit) || 20, 100);
		const skip = (Number(page) > 1 ? (Number(page) - 1) * take : 0);

		let findOptions: any = { where, take, skip };
		if (where.OR) {
			findOptions = {
				take,
				skip,
				where: where.OR,
			};
		}

		return this.gameRepository.find(findOptions);
	}
}
