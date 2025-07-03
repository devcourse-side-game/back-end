import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class GetGamesQueryDto {
	@ApiPropertyOptional({
		description: '플랫폼 필터 (steam, riot, blizzard, custom)',
		enum: ['steam', 'riot', 'blizzard', 'custom'],
	})
	@IsOptional()
	@IsString()
	platform?: string;

	@ApiPropertyOptional({ description: '활성화 여부', type: Boolean })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: '최대 조회 개수', type: Number, default: 20, maximum: 100 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;

	@ApiPropertyOptional({ description: '페이지 번호(1부터 시작)', type: Number, default: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ description: '게임명, 슬러그, Steam App ID로 검색', type: String })
	@IsOptional()
	@IsString()
	search?: string;
}
