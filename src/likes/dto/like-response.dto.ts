import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
	@ApiProperty({
		description: '좋아요 상태 메시지',
		example: '좋아요를 추가했습니다.',
	})
	message: string;
}

export class LikeStatusResponseDto {
	@ApiProperty({
		description: '좋아요 상태',
		example: true,
	})
	liked: boolean;
}

export class BatchLikeStatusResponseDto {
	@ApiProperty({
		description: '사용자 ID별 좋아요 상태',
		example: { '1': true, '2': false, '3': true },
		additionalProperties: { type: 'boolean' },
	})
	records: { [userId: number]: boolean };
}

export class LikeErrorResponseDto {
	@ApiProperty({
		description: '에러 메시지',
		example: '자신에게 좋아요를 추가할 수 없습니다.',
	})
	message: string;

	@ApiProperty({
		description: '에러 코드',
		example: 400,
	})
	statusCode: number;
}

export class LikeNotFoundResponseDto {
	@ApiProperty({
		description: '에러 메시지',
		example: '좋아요를 찾을 수 없습니다.',
	})
	message: string;

	@ApiProperty({
		description: '에러 코드',
		example: 404,
	})
	statusCode: number;
}

export class LikeAlreadyExistsResponseDto {
	@ApiProperty({
		description: '에러 메시지',
		example: '이미 좋아요를 추가했습니다.',
	})
	message: string;

	@ApiProperty({
		description: '에러 코드',
		example: 409,
	})
	statusCode: number;
}
