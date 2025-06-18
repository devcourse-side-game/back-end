import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';

@Module({
	imports: [TypeOrmModule.forFeature([])],
	controllers: [UsersController],
	providers: [],
	exports: [],
})
export class UsersModule {}
