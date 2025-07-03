import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGameProfilesController } from './controllers/user-game-profiles.controller';
import { UserGameProfilesService } from './services/user-game-profiles.service';
import { UserGameProfile } from './entities/user-game-profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserGameProfile]), AuthModule],
	controllers: [UserGameProfilesController],
	providers: [UserGameProfilesService],
	exports: [UserGameProfilesService],
})
export class UserGameProfilesModule {}
