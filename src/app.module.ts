import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PartiesModule } from './parties/parties.module';
import { GamesModule } from './games/games.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}), // .env 파일 로드
		TypeOrmModule.forRoot({
			type: 'mysql', // 또는 사용하는 DB 타입
			host: process.env.DATABASE_HOST,
			port: Number(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: false, // 운영환경에서는 false 권장
		}),
		UsersModule,
		AuthModule,
		PartiesModule,
		GamesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
