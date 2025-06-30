import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinPartyDto {
	@ApiProperty({
		example: '1234',
		description: '비공개 파티의 경우 필요한 접근 코드',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(20, { message: '접근 코드는 20자를 초과할 수 없습니다.' })
	accessCode?: string;
}
