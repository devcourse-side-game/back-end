import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({ example: 'user123@gmail.com', description: '사용자 이메일일' })
	@IsEmail()
	@MaxLength(50, { message: '이메일은 50자를 초과할 수 없습니다.' })
	email: string;

	@ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
	@MaxLength(100, { message: '비밀번호는 100자를 초과할 수 없습니다.' })
	password: string;
}

export class RegisterDto {
	@ApiProperty({ example: 'user123@gmail.com', description: '사용자 이메일' })
	@IsEmail()
	@MaxLength(50, { message: '이메일은 50자를 초과할 수 없습니다.' })
	email: string;

	@ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
	@MaxLength(100, { message: '비밀번호는 100자를 초과할 수 없습니다.' })
	password: string;

	@ApiProperty({ example: 'user123', description: '사용자 이름' })
	@MaxLength(10, { message: '이름은 10자를 초과할 수 없습니다.' })
	username: string;
}
