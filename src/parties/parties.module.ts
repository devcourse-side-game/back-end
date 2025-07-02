import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesController } from './controllers/parties.controller';
import { PartiesService } from './services/parties.service';
import { Party } from './entities/party.entity';
import { Game } from '../games/entities/game.entity';
import { User } from '../users/entities/user.entity';
import { PartyMember } from './entities/party-members.entity';
import { PartyMembersController } from './controllers/party-members.controller';
import { PartyMembersService } from './services/party-members.service';
import { UserGameProfilesModule } from '../user-game-profiles/user-game-profiles.module';

@Module({
	imports: [TypeOrmModule.forFeature([Party, Game, User, PartyMember]), UserGameProfilesModule],
	controllers: [PartiesController, PartyMembersController],
	providers: [PartiesService, PartyMembersService],
	exports: [PartiesService, PartyMembersService],
})
export class PartiesModule {}
