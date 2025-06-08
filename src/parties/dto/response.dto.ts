import { ApiProperty } from '@nestjs/swagger';

// 기본 파티 정보 DTO (재사용 가능)
export class PartyDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: '로스트아크 발탄 하드 파티 모집' })
	title: string;

	@ApiProperty({ example: 1 })
	game_id: number;

	@ApiProperty({ example: '로스트아크' })
	game_name: string;

	@ApiProperty({ example: '레이드' })
	purpose_tag: string;

	@ApiProperty({ example: 8 })
	max_participants: number;

	@ApiProperty({ example: 3 })
	current_participants: number;

	@ApiProperty({ example: '2025-06-10T18:00:00' })
	start_time: string;

	@ApiProperty({ example: '2025-06-10T20:00:00' })
	end_time: string;

	@ApiProperty({ example: false })
	is_completed: boolean;

	@ApiProperty({ example: false })
	is_private: boolean;

	@ApiProperty({ example: 1 })
	creator_id: number;

	@ApiProperty({ example: 'user123' })
	creator_name: string;

	@ApiProperty({ example: '2025-06-03T14:30:00+09:00' })
	created_at: string;

	@ApiProperty({ example: '2025-06-03T14:30:00+09:00' })
	updated_at: string;
}

// 파티 목록 응답 DTO
export class PartyListResponseDto {
	@ApiProperty({ type: [PartyDto] })
	parties: PartyDto[];

	@ApiProperty({ example: 10 })
	total: number;

	@ApiProperty({ example: 1 })
	page: number;

	@ApiProperty({ example: 10 })
	limit: number;
}

// 파티 상세 정보 응답 DTO
export class PartyDetailResponseDto extends PartyDto {
	@ApiProperty({ example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다.' })
	description: string;

	@ApiProperty({
		example: [
			{ id: 1, username: 'user123', is_leader: true, joined_at: '2025-06-03T14:30:00+09:00' },
			{
				id: 2,
				username: 'user456',
				is_leader: false,
				joined_at: '2025-06-03T14:35:00+09:00',
			},
		],
	})
	members: Array<{
		id: number;
		username: string;
		is_leader: boolean;
		joined_at: string;
	}>;
}

// 파티 생성/수정/삭제 응답 DTO
export class PartyResponseDto {
	@ApiProperty({ example: '파티가 성공적으로 생성되었습니다.' })
	message: string;

	@ApiProperty({ example: 1 })
	partyId: number;
}

// 파티원 목록 응답 DTO
export class MemberListResponseDto {
	@ApiProperty({
		example: [
			{ id: 1, username: 'user123', is_leader: true, joined_at: '2025-06-03T14:30:00+09:00' },
			{
				id: 2,
				username: 'user456',
				is_leader: false,
				joined_at: '2025-06-03T14:35:00+09:00',
			},
		],
	})
	members: Array<{
		id: number;
		username: string;
		is_leader: boolean;
		joined_at: string;
	}>;

	@ApiProperty({ example: 1 })
	party_id: number;

	@ApiProperty({ example: '로스트아크 발탄 하드 파티 모집' })
	party_title: string;
}

// 에러 응답 DTO
export class PartiesErrorResponseDto {
	@ApiProperty({ example: 400 })
	statusCode: number;

	@ApiProperty({ example: '잘못된 요청입니다.' })
	message: string;

	@ApiProperty({ example: 'Bad Request' })
	error: string;
}
