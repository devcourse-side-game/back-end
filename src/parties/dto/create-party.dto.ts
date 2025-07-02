import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsString,
	IsOptional,
	IsBoolean,
	MaxLength,
	Min,
	ValidateIf,
	IsNotEmpty,
	MinLength,
} from 'class-validator';

export class CreatePartyDto {
	@ApiProperty({ example: '파티 제목', description: '파티 제목' })
	@IsNotEmpty()
	@IsString()
	@MinLength(1, { message: '파티 제목은 최소 1자 이상이어야 합니다.' })
	@MaxLength(100, { message: '파티 제목은 100자를 초과할 수 없습니다.' })
	title: string;

	@ApiProperty({ example: 1, description: '게임 ID' })
	@IsInt()
	gameId: number;

	@ApiProperty({
		description:
			'사용자의 기존 게임 프로필 ID. profileId와 gameUsername 중 하나는 필수이며, profileId가 우선적으로 사용됩니다.',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsInt()
	@ValidateIf((o: CreatePartyDto) => !o.gameUsername)
	@IsNotEmpty({ message: 'profileId 또는 gameUsername 중 하나는 필수입니다.' })
	profileId?: number;

	@ApiProperty({
		description:
			'새로 생성할 게임 프로필의 유저네임. profileId와 gameUsername 중 하나는 필수입니다.',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	@ValidateIf((o: CreatePartyDto) => !o.profileId)
	@IsNotEmpty({ message: 'profileId 또는 gameUsername 중 하나는 필수입니다.' })
	gameUsername?: string;

	@ApiProperty({
		description: '파티 목적 태그',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(50)
	purposeTag?: string;

	@ApiProperty({ example: 8, description: '최대 참가자 수' })
	@IsInt()
	@Min(2)
	maxParticipants: number;

	@ApiProperty({ example: '파티 설명', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@ApiProperty({ example: false, required: false })
	@IsOptional()
	@IsBoolean()
	isPrivate?: boolean;

	@ApiProperty({ example: 'secret123', required: false })
	@ValidateIf((o: CreatePartyDto) => o.isPrivate === true)
	@IsNotEmpty()
	@IsString()
	@MaxLength(20)
	accessCode?: string;
}
