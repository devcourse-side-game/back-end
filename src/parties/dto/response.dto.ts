import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export class UserGameProfileDto {
	@ApiProperty({ example: 'player123' })
	gameUsername: string;
}

export class PartyMemberDto {
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

	@ApiProperty({ type: () => UserGameProfileDto })
	userGameProfile: UserGameProfileDto;
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

	@ApiProperty({ type: () => User })
	creator: User;

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
	@ApiProperty({ type: [PartyMemberDto] })
	members: PartyMemberDto[];

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
