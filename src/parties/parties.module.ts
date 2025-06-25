import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesController } from './controllers/parties.controller';
import { PartiesService } from './services/parties.service';
import { Party } from './entities/party.entity';
import { UserGameProfile } from './entities/user-game-profile.entity';
import { Game } from '../games/entities/game.entity';
import { User } from '../users/entities/user.entity';
import { PartyMember } from './entities/party-members.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Party, UserGameProfile, Game, User, PartyMember])],
	controllers: [PartiesController],
	providers: [PartiesService],
	exports: [PartiesService],
})
export class PartiesModule {}
