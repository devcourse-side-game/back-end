import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
	@ApiProperty({ description: '사용자 이름', example: 'user123', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(50, { message: '사용자 이름은 50자를 초과할 수 없습니다.' })
	username?: string;

	@ApiProperty({ description: '이메일', example: 'user@example.com', required: false })
	@IsOptional()
	@IsEmail()
	@MaxLength(50, { message: '이메일은 50자를 초과할 수 없습니다.' })
	email?: string;
}
