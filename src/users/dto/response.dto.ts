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
	@ApiProperty({ example: 401 })
	statusCode: number;

	@ApiProperty({ example: '인증에 실패했습니다.' })
	message: string;

	@ApiProperty({ example: 'Unauthorized' })
	error: string;
}
