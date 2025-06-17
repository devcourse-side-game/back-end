import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module'; // AppModule로 변경!
import { SteamBatchService } from '../steam-batch.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule); // AppModule로 변경!
	const steamBatchService = app.get(SteamBatchService);
	await steamBatchService.fetchAndUpsertSteamGames();
	await app.close();
}

bootstrap().catch((err) => {
	console.error('Batch runner failed:', err);
	process.exit(1);
});
