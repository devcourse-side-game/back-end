import { ApiProperty } from '@nestjs/swagger';

// 사용자 정보 응답 DTO
export class UserProfileResponseDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'user123', description: '사용자 닉네임' })
	username: string;

	@ApiProperty({ example: 'user@example.com', description: '이메일', required: false })
	email: string;

	@ApiProperty({ example: '2025-05-13T11:15:15+09:00', description: '가입일' })
	createdAt: string;

	@ApiProperty({ example: '2025-05-13T11:15:15+09:00', description: '수정일' })
	updatedAt: string;
}

// 사용자 정보 수정 성공 응답 DTO
export class UpdateProfileResponseDto {
	@ApiProperty({ example: '사용자 정보 수정 성공' })
	message: string;
}

// 비밀번호 변경 성공 응답 DTO
export class ChangePasswordResponseDto {
	@ApiProperty({ example: '비밀번호가 성공적으로 변경되었습니다.' })
	message: string;
}

// 계정 삭제 성공 응답 DTO
export class DeleteAccountResponseDto {
	@ApiProperty({ example: '계정이 성공적으로 삭제되었습니다.' })
	message: string;
}

// 에러 응답 DTO
export class UsersErrorResponseDto {
	@ApiProperty({ example: 404 })
	statusCode: number;

	@ApiProperty({ example: '사용자를 찾을 수 없습니다.' })
	message: string;

	@ApiProperty({ example: 'Not Found' })
	error: string;
}

export class PasswordErrorResponseDto {
	@ApiProperty({ example: 401 })
	statusCode: number;

	@ApiProperty({ example: '현재 비밀번호가 일치하지 않습니다.' })
	message: string;

	@ApiProperty({ example: 'Unauthorized' })
	error: string;
}

export class UserAlreadyExistsResponseDto {
	@ApiProperty({ example: 401 })
	statusCode: number;

	@ApiProperty({ example: '이미 사용 중인 사용자 이름입니다.' })
	message: string;

	@ApiProperty({ example: 'Unauthorized' })
	error: string;
}

export class EmailAlreadyExistsResponseDto {
	@ApiProperty({ example: 409 })
	statusCode: number;

	@ApiProperty({ example: '이미 사용 중인 이메일입니다.' })
	message: string;

	@ApiProperty({ example: 'Conflict' })
	error: string;
}
	
	