import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmConfig = TypeOrmModule.forRootAsync({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		type: 'mysql',
		host: configService.get('DATABASE_HOST'),
		port: Number(configService.get('DATABASE_PORT')),
		username: configService.get('DATABASE_USER'),
		password: configService.get('DATABASE_PASSWORD'),
		database: configService.get('DATABASE_NAME'),
		entities: [__dirname + '/**/*.entity.{js,ts}'],
		synchronize: true, // 개발 환경에서만 true로 설정
	})
});