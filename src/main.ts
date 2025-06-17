import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppExceptionFilter } from './common/filters/app-exception.filters';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// 쿠키 파서 미들웨어 등록
	app.use(cookieParser());

	// validationPipe 등록
	app.useGlobalPipes(new ValidationPipe());

	// 전역 예외 필터 등록
	app.useGlobalFilters(new AppExceptionFilter());

	// CORS 설정
	app.enableCors({
		origin: true,
		credentials: true,
	});

	// API 접두사 설정
	app.setGlobalPrefix('api');

	// Swagger 설정
	const config = new DocumentBuilder()
		.setTitle('Game Party API')
		.setDescription('Game Party API 문서')
		.setVersion('1.0')
		.addTag('auth', '인증 관리 API')
		.addTag('users', '사용자 관리 API')
		.addTag('parties', '파티 관리 API')
		.addTag('likes', '좋아요 관리 API')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: '인증을 위한 JWT 토큰을 입력하세요',
				in: 'header',
			},
			'access-token',
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('gameParty-api-docs', app, document);

	await app.listen(process.env.PORT ?? 3000);

	console.log(`애플리케이션이 실행 중입니다: ${await app.getUrl()}`);
	console.log(`Swagger 문서: ${await app.getUrl()}/gameParty-api-docs`);
}
bootstrap();
