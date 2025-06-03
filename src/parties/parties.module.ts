import { Module } from '@nestjs/common';
import { PartiesController } from './controllers/parties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PartiesController],
  providers: [], // 서비스는 나중에 추가
  exports: [],
})
export class PartiesModule {}
