import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from 'typeorm';

@Entity('games')
@Index('idx_name_platform', ['name', 'platforms'])
export class Game {
	@PrimaryGeneratedColumn({ unsigned: true })
	id: number;

	@Column({ length: 255 })
	name: string;

	@Column({ type: 'enum', enum: ['steam', 'riot', 'blizzard', 'custom'] })
	platforms: 'steam' | 'riot' | 'blizzard' | 'custom';

	@Index({ unique: true })
	@Column({ type: 'int', unsigned: true, nullable: true })
	steamAppId?: number;

	@Column({ length: 255, nullable: true })
	bannerUrl?: string;

	@Column({ type: 'tinyint', default: 1 })
	isActive: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ length: 255, unique: true })
	slug: string;
}
