import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfig } from './model';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PartiesModule } from './parties/parties.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}), // .env 파일 로드
		// TypeOrmConfig, // TypeORM 설정
		UsersModule,
		AuthModule,
		PartiesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
