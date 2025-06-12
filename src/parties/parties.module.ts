import { Module } from '@nestjs/common';
import { PartiesController } from './controllers/parties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Party])],
	controllers: [PartiesController],
	providers: [], // 서비스는 나중에 추가
	exports: [],
})
export class PartiesModule {}
