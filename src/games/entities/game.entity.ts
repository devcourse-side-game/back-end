import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	OneToMany,
} from 'typeorm';
import { Party } from '../../parties/entities/party.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Games')
@Index('idx_name_platform', ['name', 'platforms'])
export class Game {
	@ApiProperty({ example: 1, description: '게임 고유 ID' })
	@PrimaryGeneratedColumn({ name: 'id' })
	id: number;

	@ApiProperty({ example: 'League of Legends', description: '게임 이름' })
	@Column({ name: 'name', length: 255 })
	name: string;

	@ApiProperty({
		example: 'steam',
		description: '플랫폼 구분',
		enum: ['steam', 'riot', 'blizzard', 'custom'],
	})
	@Column({
		type: 'enum',
		enum: ['steam', 'riot', 'blizzard', 'custom'],
		name: 'platforms',
	})
	platforms: 'steam' | 'riot' | 'blizzard' | 'custom';

	@ApiProperty({ example: 570, description: 'Steam App ID', required: false, nullable: true })
	@Index({ unique: true })
	@Column({ type: 'int', unsigned: true, nullable: true, name: 'steam_app_id' })
	steamAppId?: number;

	@ApiProperty({
		example: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
		description: '게임 배너 이미지 URL',
		required: false,
		nullable: true,
	})
	@Column({ length: 255, nullable: true, name: 'banner_url' })
	bannerUrl?: string;

	@ApiProperty({ example: true, description: '활성화 여부' })
	@Column({ type: 'tinyint', default: 1, name: 'is_active' })
	isActive: boolean;

	@ApiProperty({ example: '2024-06-23T12:34:56.000Z', description: '생성일' })
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@ApiProperty({ example: '2024-06-23T12:34:56.000Z', description: '수정일' })
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@ApiProperty({ example: 'league-of-legends', description: '슬러그(고유 식별자)' })
	@Column({ length: 255, unique: true, name: 'slug' })
	slug: string;

	@OneToMany(() => Party, (party) => party.game)
	parties: Party[];
}
