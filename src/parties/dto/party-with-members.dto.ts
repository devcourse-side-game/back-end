import { ApiProperty } from '@nestjs/swagger';

export class PartyMemberSummaryDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	userId: number;

	@ApiProperty({ example: '닉네임' })
	username: string;

	@ApiProperty()
	isLeader: boolean;

	@ApiProperty()
	joinedAt: Date;

	@ApiProperty({ required: false })
	leftAt?: Date;

	@ApiProperty({ example: 'pro_gamer123', description: '게임 내 닉네임' })
	gameUsername: string;
}

// 파티에서만 사용하는 생성자 정보 DTO (password 등 민감 정보 제외)
export class PartyCreatorDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'user1' })
	username: string;

	@ApiProperty({ example: 'user1@gmail.com' })
	email: string;

	@ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
	profileImage?: string;
}

export class PartyWithMembersDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: '파티 제목' })
	title: string;

	@ApiProperty({ example: 1 })
	gameId: number;

	@ApiProperty({ example: 1 })
	creatorId: number;

	@ApiProperty({ type: PartyCreatorDto })
	creator: PartyCreatorDto;

	@ApiProperty({ example: '경쟁전', required: false })
	purposeTag?: string;

	@ApiProperty({ example: 8 })
	maxParticipants: number;

	@ApiProperty({ example: '파티 설명', required: false })
	description?: string;

	@ApiProperty({ example: false })
	isPrivate: boolean;

	@ApiProperty({ example: '1234', required: false })
	accessCode?: string;

	@ApiProperty({ example: false })
	isCompleted: boolean;

	@ApiProperty({ example: '2025-06-10T18:00:00' })
	createdAt: Date;

	@ApiProperty({ example: '2025-06-10T18:00:00' })
	updatedAt: Date;

	@ApiProperty({ type: [PartyMemberSummaryDto] })
	members: PartyMemberSummaryDto[];
}
