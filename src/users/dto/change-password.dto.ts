import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChangePasswordDto {
	@ApiProperty({ description: '현재 비밀번호', example: 'currentPassword123' })
	@IsNotEmpty()
	@IsString()
	@MaxLength(20, { message: '비밀번호는 20자를 초과할 수 없습니다.' })
	currentPassword: string;

	@ApiProperty({ description: '새 비밀번호', example: 'newPassword123' })
	@IsNotEmpty()
	@IsString()
	@MaxLength(20, { message: '비밀번호는 20자를 초과할 수 없습니다.' })
	newPassword: string;
}
