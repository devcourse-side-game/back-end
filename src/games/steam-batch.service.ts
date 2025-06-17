import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface SteamApp {
	appid: number;
	name: string;
}
interface SteamAppListResponse {
	applist: { apps: SteamApp[] };
}

interface BulkGame {
	name: string;
	platforms: 'steam'; // Game entity의 platforms 타입과 일치하도록 수정
	steamAppId: number;
	bannerUrl: string;
	slug: string;
	isActive: boolean;
}

@Injectable()
export class SteamBatchService {
	private readonly logger = new Logger(SteamBatchService.name);

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
		private readonly httpService: HttpService,
	) {}

	async fetchAndUpsertSteamGames() {
		const url = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';
		try {
			const response = await firstValueFrom(this.httpService.get<SteamAppListResponse>(url));

			if (!response || typeof response !== 'object' || !('data' in response)) {
				throw new Error(`Steam API 응답 타입 오류 (url: ${url})`);
			}

			const data = response.data;
			const apps = data?.applist?.apps ?? [];

			const bulkGames: BulkGame[] = apps
				.filter((a) => a.name?.trim().length)
				.map(
					(app: SteamApp): BulkGame => ({
						name: app.name,
						platforms: 'steam' as const, // platforms를 'steam'으로 설정
						steamAppId: app.appid,
						bannerUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${app.appid}/header.jpg`,
						slug: this.slugify(app.name, app.appid).slice(0, 255),
						isActive: true,
					}),
				);

			const CHUNK_SIZE = 1000;
			const entities = bulkGames.map((game) => this.gameRepository.create(game));

			for (const chunk of chunkArray(entities, CHUNK_SIZE)) {
				await this.gameRepository.upsert(chunk, {
					conflictPaths: ['steamAppId'], // 충돌 필드 지정
					skipUpdateIfNoValuesChanged: true, // 변경사항이 없으면 업데이트 건너뛰기
				});
			}
			this.logger.log(`Steam 게임 ${bulkGames.length}건 upsert 완료`);
		} catch (e) {
			this.logger.error(
				`Steam 게임 목록 동기화 실패 (url: ${url})`,
				e instanceof Error ? e.stack : e,
			);
			throw e;
		}
	}

	/**
	 * Steam 게임명 → slug
	 * - 영문·숫자만 남기고 하이픈 처리
	 * - 결과가 빈 문자열일 경우 `${platform}-${appid}` 로 대체해 중복/빈 값 방지
	 */
	private slugify(name: string, appid: number): string {
		const base = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');
		return base.length ? base : `steam-${appid}`;
	}
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize));
	}
	return result;
}
