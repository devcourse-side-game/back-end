import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartyListLeaderDto {
	@ApiProperty({ example: 1, description: '리더 유저 ID' })
	userId: number;

	@ApiProperty({ example: 'user1', description: '리더 유저네임' })
	username: string;

	@ApiProperty({ example: 'pro_gamer123', description: '리더의 게임 내 닉네임' })
	gameUsername: string;
}

export class PartyListItemDto {
	@ApiProperty({ example: 1, description: '파티 ID' })
	id: number;

	@ApiProperty({ example: '같이 즐겁게 게임해요', description: '파티 제목' })
	title: string;

	@ApiProperty({ example: 1, description: '게임 ID' })
	gameId: number;

	@ApiProperty({
		example: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
		description: '게임 배너 이미지 URL',
	})
	gameBannerUrl: string;

	@ApiProperty({ example: 1, description: '파티 리더 ID' })
	leaderId: number;

	@ApiPropertyOptional({ example: '레이드', description: '파티 목적 태그' })
	purposeTag?: string;

	@ApiProperty({ example: 8, description: '최대 인원' })
	maxParticipants: number;

	@ApiPropertyOptional({ example: '파티 설명', description: '파티 설명' })
	description?: string;

	@ApiProperty({ example: false, description: '비공개 여부' })
	isPrivate: boolean;

	@ApiPropertyOptional({ example: '1234', description: '비공개 파티 접근 코드' })
	accessCode?: string;

	@ApiProperty({ example: false, description: '완료 여부' })
	isCompleted: boolean;

	@ApiProperty({ example: '2025-06-10T18:00:00', description: '생성일' })
	createdAt: Date;

	@ApiProperty({ example: '2025-06-10T18:00:00', description: '수정일' })
	updatedAt: Date;

	@ApiProperty({ type: () => PartyListLeaderDto, nullable: true, description: '리더 정보' })
	leader: PartyListLeaderDto | null;

	@ApiProperty({ example: 3, description: '현재 멤버 수' })
	currentMemberCount: number;
}

export class PartyMemberDetailDto {
	@ApiProperty({ example: 1 })
	id: number; // PartyMembers.id

	@ApiProperty({ example: 2 })
	userId: number;

	@ApiProperty({ example: '닉네임' })
	username: string;

	@ApiProperty({ example: true })
	isLeader: boolean;

	@ApiProperty({ example: '2025-06-27T09:00:00+09:00' })
	joinedAt: string;

	@ApiProperty({ example: 'player123', description: '게임 내 닉네임' })
	gameUsername: string;
}

// 기본 파티 정보 DTO (재사용 가능)
export class PartyDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: '로스트아크 발탄 하드 파티 모집' })
	title: string;

	@ApiProperty({ example: 1 })
	gameId: number;

	@ApiProperty({ example: '로스트아크' })
	gameName: string;

	@ApiProperty({ example: '레이드' })
	purposeTag: string;

	@ApiProperty({ example: 8 })
	maxParticipants: number;

	@ApiProperty({ example: 3 })
	currentParticipants: number;

	@ApiProperty({ example: false })
	isCompleted: boolean;

	@ApiProperty({ example: false })
	isPrivate: boolean;

	@ApiProperty({ type: () => PartyListLeaderDto, description: '파티 리더 정보', required: false })
	leader: PartyListLeaderDto | null;

	@ApiProperty({ example: '2025-06-03T14:30:00+09:00' })
	createdAt: string;

	@ApiProperty({ example: '2025-06-03T14:30:00+09:00' })
	updatedAt: string;
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

class MemberDto {
	@ApiProperty()
	id: number;
	@ApiProperty()
	username: string;
	@ApiProperty()
	isLeader: boolean;
	@ApiProperty()
	joinedAt: string;
}

// 파티 상세 정보 응답 DTO
export class PartyDetailResponseDto extends PartyDto {
	@ApiProperty({ example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다.' })
	description: string;

	@ApiProperty({
		type: [MemberDto],
	})
	members: MemberDto[];
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
	@ApiProperty({ type: [PartyMemberDetailDto] })
	members: PartyMemberDetailDto[];

	@ApiProperty({ example: 1 })
	partyId: number;

	@ApiProperty({ example: '파티 제목' })
	partyTitle: string;
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
