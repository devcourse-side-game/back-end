import { ApiProperty } from '@nestjs/swagger';

// 게임 정보 응답 DTO
export class GameResponseDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'League of Legends', description: '게임 이름' })
	name: string;

	@ApiProperty({
		example: 'riot',
		description: '플랫폼',
		enum: ['steam', 'riot', 'blizzard', 'custom'],
	})
	platforms: 'steam' | 'riot' | 'blizzard' | 'custom';

	@ApiProperty({ example: 570, description: 'Steam App ID', required: false })
	steamAppId?: number;

	@ApiProperty({
		example: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
		description: '배너 이미지 URL',
		required: false,
	})
	bannerUrl?: string;

	@ApiProperty({ example: true, description: '활성화 여부' })
	isActive: boolean;

	@ApiProperty({ example: '2025-06-10T10:00:00+09:00', description: '생성일' })
	createdAt: string;

	@ApiProperty({ example: '2025-06-12T15:42:00+09:00', description: '수정일' })
	updatedAt: string;

	@ApiProperty({ example: 'league-of-legends', description: '슬러그' })
	slug: string;
}

// 게임 생성/수정 성공 응답 DTO
export class GameSuccessResponseDto {
	@ApiProperty({ example: '게임 정보가 성공적으로 처리되었습니다.' })
	message: string;
}

// 게임 삭제(Soft Delete) 성공 응답 DTO
export class GameDeleteResponseDto {
	@ApiProperty({ example: '게임이 성공적으로 삭제되었습니다.' })
	message: string;
}

// 에러 응답 DTO
export class GamesErrorResponseDto {
	@ApiProperty({ example: 404 })
	statusCode: number;

	@ApiProperty({ example: '게임을 찾을 수 없습니다.' })
	message: string;

	@ApiProperty({ example: 'Not Found' })
	error: string;
}
