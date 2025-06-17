// swagger api static 문서용 json 생성
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
		ignoreGlobalPrefix: false,
	});

	// Swagger JSON 파일로 저장
	fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

	await app.close();
}
bootstrap();
