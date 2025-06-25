import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateIf,
} from 'class-validator';

export class UpdatePartyDto {
	@ApiPropertyOptional({
		example: '로스트아크 발탄 하드 파티 모집 (수정)',
		description: '파티 제목',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(100, { message: '파티 제목은 100자를 초과할 수 없습니다.' })
	title?: string;

	@ApiPropertyOptional({ example: 1, description: '게임 ID', required: false })
	@IsOptional()
	@IsInt({ message: '게임 ID는 정수여야 합니다.' })
	gameId?: number;

	@ApiPropertyOptional({ example: '레이드', description: '목적 태그', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(50, { message: '목적 태그는 50자를 초과할 수 없습니다.' })
	purposeTag?: string;

	@ApiPropertyOptional({ example: 8, description: '최대 참가자 수', required: false })
	@IsOptional()
	@IsInt({ message: '최대 참가자 수는 정수여야 합니다.' })
	@Min(2, { message: '최대 참가자 수는 2명 이상이어야 합니다.' })
	maxParticipants?: number;

	@ApiPropertyOptional({
		example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다. (수정)',
		description: '파티 설명',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(500, { message: '파티 설명은 500자를 초과할 수 없습니다.' })
	description?: string;

	@ApiPropertyOptional({ example: false, description: '비공개 파티 여부', required: false })
	@IsOptional()
	@IsBoolean({ message: '비공개 파티 여부는 불리언 값이어야 합니다.' })
	isPrivate?: boolean;

	@ApiPropertyOptional({
		example: '5678',
		description: '접근 코드 (비공개 파티인 경우)',
		required: false,
	})
	@ValidateIf((o: UpdatePartyDto) => o.isPrivate === true)
	@IsOptional()
	@IsString()
	@MaxLength(20, { message: '접근 코드는 20자를 초과할 수 없습니다.' })
	accessCode?: string;

	@ApiPropertyOptional({ example: true, description: '완료 여부', required: false })
	@IsOptional()
	@IsBoolean({ message: '완료 여부는 불리언 값이어야 합니다.' })
	isCompleted?: boolean;
}
