import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class JoinPartyDto {
	@ApiProperty({
		example: '1234',
		description: '비공개 파티의 경우 필요한 접근 코드 (공개 파티는 생략 가능)',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(20, { message: '접근 코드는 20자를 초과할 수 없습니다.' })
	accessCode?: string;

	@ApiProperty({
		description:
			'사용자의 기존 게임 프로필 ID. profileId와 gameUsername 중 하나는 필수이며, profileId가 우선적으로 사용됩니다.',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsInt()
	@ValidateIf((o: JoinPartyDto) => !o.gameUsername)
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
	@ValidateIf((o: JoinPartyDto) => !o.profileId)
	@IsNotEmpty({ message: 'profileId 또는 gameUsername 중 하나는 필수입니다.' })
	@MaxLength(100)
	gameUsername?: string;
}
