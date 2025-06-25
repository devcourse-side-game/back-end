import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Game } from '../../games/entities/game.entity';
import { User } from '../../users/entities/user.entity';
import { PartyMember } from './party-members.entity';

@Entity('Parties')
export class Party {
	@PrimaryGeneratedColumn()
	@ApiProperty({ example: 1, description: '파티 ID' })
	id: number;

	@ApiProperty({ example: '같이 즐겁게 게임해요', description: '파티 제목' })
	@Column({ length: 100 })
	title: string;

	@Column({ name: 'game_id' })
	gameId: number;

	@Column({ name: 'creator_id' })
	creatorId: number;

	@ApiProperty({ example: '경쟁전', description: '목적 태그' })
	@Column({ length: 50, nullable: true, name: 'purpose_tag' })
	purposeTag: string;

	@ApiProperty({ example: 8, description: '최대 참가자 수' })
	@Column({ name: 'max_participants' })
	maxParticipants: number;

	@ApiProperty({
		example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다.',
		description: '파티 설명',
	})
	@Column({ type: 'text', nullable: true })
	description: string;

	@ApiProperty({ example: false, description: '비공개 파티 여부' })
	@Column({ default: false, name: 'is_private' })
	isPrivate: boolean;

	@ApiProperty({
		example: '1234',
		description: '접근 코드 (비공개 파티인 경우)',
		required: false,
	})
	@Column({ length: 20, nullable: true, name: 'access_code' })
	accessCode: string;

	@ApiProperty({ example: false, description: '완료 여부' })
	@Column({ default: false, name: 'is_completed' })
	isCompleted: boolean;

	@ApiProperty({ example: '2025-06-10T18:00:00', description: '게시글 생성 시간' })
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@ApiProperty({ example: '2025-06-10T18:00:00', description: '게시글 수정 시간' })
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@ManyToOne(() => Game, (game) => game.parties)
	@JoinColumn({ name: 'game_id' })
	game: Game;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'creator_id' })
	creator: User;

	@OneToMany(() => PartyMember, (member) => member.party)
	members: PartyMember[];
}
