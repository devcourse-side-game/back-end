import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
	MaxLength,
	Min,
	ValidateIf,
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

	@ApiProperty({ example: '레이드', description: '목적 태그', required: false })
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
