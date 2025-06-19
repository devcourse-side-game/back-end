import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
	@ApiProperty({ example: '로그인 성공' })
	message: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	accessToken: string;
}

export class RegisterResponseDto {
	@ApiProperty({ example: '회원가입이 완료되었습니다.' })
	message: string;
}

export class LogoutResponseDto {
	@ApiProperty({ example: '로그아웃 성공' })
	message: string;
}

export class NicknameCheckResponseDto {
	@ApiProperty({ example: '사용 가능한 닉네임입니다.' })
	message: string;
}

export class AuthErrorResponseDto {
	@ApiProperty({ example: 401 })
	statusCode: number;

	@ApiProperty({ example: '인증에 실패했습니다.' })
	message: string;

	@ApiProperty({ example: 'Unauthorized' })
	error: string;
}
