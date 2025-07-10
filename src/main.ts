import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppExceptionFilter } from './common/filters/app-exception.filters';
import { readFileSync } from 'fs';

async function bootstrap() {
	let httpsOptions: any = undefined;

	// SSL 인증서 파일이 존재하는 경우 HTTPS 설정
	if (process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
		try {
			httpsOptions = {
				key: readFileSync(process.env.SSL_KEY_PATH),
				cert: readFileSync(process.env.SSL_CERT_PATH),
				...(process.env.SSL_CA_PATH && {
					ca: readFileSync(process.env.SSL_CA_PATH),
				}), // ca 옵션 동적 추가
			};
			console.log('SSL 인증서를 찾았습니다. HTTPS 서버로 시작합니다.');
		} catch (error) {
			console.warn(
				'SSL 인증서 파일을 읽을 수 없습니다. HTTP 서버로 시작합니다.',
				error instanceof Error ? error.message : error,
			);
		}
	}

	const app = await NestFactory.create(AppModule, {
		httpsOptions,
	});

	// 쿠키 파서 미들웨어 등록
	app.use(cookieParser());

	// validationPipe 등록 (타입 변환 활성화)
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { enableImplicitConversion: true },
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

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

	await app.listen(process.env.PORT ?? 4545);

	const protocol = httpsOptions ? 'https' : 'http';
	const port = process.env.PORT ?? 4545;
	console.log(`애플리케이션이 ${protocol}://localhost:${port} 에서 실행 중입니다.`);
	console.log(`Swagger 문서: ${protocol}://localhost:${port}/gameParty-api-docs`);
}
bootstrap().catch((error) => {
	console.error('애플리케이션 시작 중 오류 발생:', error);
	process.exit(1);
});
