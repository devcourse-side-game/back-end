import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Game } from './entities/game.entity';
import { SteamBatchService } from './services/steam-batch.service';
import { GamesController } from './controllers/games.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Game]), HttpModule],
	controllers: [GamesController],
	providers: [SteamBatchService],
	exports: [SteamBatchService],
})
export class GamesModule {}
