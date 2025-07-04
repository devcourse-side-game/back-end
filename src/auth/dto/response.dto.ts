import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
	@ApiProperty({ example: '로그인 성공' })
	message: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	accessToken: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', required: false })
	refreshToken?: string;
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

	@ApiProperty({ example: 'a-003', required: false })
	errorCode?: string;
}

export class NicknameCheckErrorResponseDto {
	@ApiProperty({ example: 409 })
	statusCode: number;

	@ApiProperty({ example: '이미 존재하는 이메일입니다.' })
	message: string;

	@ApiProperty({ example: 'Conflict' })
	error: string;
}

export class RefreshTokenResponseDto {
	@ApiProperty({ example: '새로운 액세스 토큰이 발급되었습니다.' })
	message: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	accessToken: string;
}

export class TokenErrorResponseDto {
	@ApiProperty({ example: 401 })
	statusCode: number;

	@ApiProperty({ example: '리프레시 토큰이 유효하지 않습니다.' })
	message: string;

	@ApiProperty({ example: 'Unauthorized' })
	error: string;

	@ApiProperty({ example: 'a-005' })
	errorCode: string;
}