import { ApiProperty } from '@nestjs/swagger';
import { Game } from '../../games/entities/game.entity';

export class UserGameProfileDto {
	@ApiProperty({ description: '프로필 ID' })
	id: number;

	@ApiProperty({ description: '사용자 ID' })
	userId: number;

	@ApiProperty({ description: '게임 ID' })
	gameId: number;

	@ApiProperty({ description: '게임 내 사용자 이름' })
	gameUsername: string;

	@ApiProperty({ description: '게임 정보', type: () => Game })
	game: Game;
}
