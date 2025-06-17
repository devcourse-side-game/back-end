import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // 추가
import { Game } from './entities/game.entity';
import { SteamBatchService } from './steam-batch.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Game]),
		HttpModule, // 추가
	],
	providers: [SteamBatchService],
	exports: [SteamBatchService],
})
export class GamesModule {}
