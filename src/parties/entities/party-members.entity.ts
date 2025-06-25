import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Column,
	CreateDateColumn,
	Index,
	JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Party } from './party.entity';
import { User } from '../../users/entities/user.entity';

@Entity('PartyMembers')
@Index('unique_party_user', ['partyId', 'userId'], { unique: true })
export class PartyMember {
	@ApiProperty({ example: 1, description: '파티멤버 ID' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 1, description: '파티 ID' })
	@Column({ name: 'party_id' })
	partyId: number;

	@ApiProperty({ example: 1, description: '유저 ID' })
	@Column({ name: 'user_id' })
	userId: number;

	@ManyToOne(() => Party, (party) => party.members, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'party_id' })
	party: Party;

	@ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ApiProperty({ example: false, description: '파티장 여부' })
	@Column({ type: 'boolean', name: 'is_leader', default: false })
	isLeader: boolean;

	@ApiProperty({ example: '2025-06-20T12:00:00.000Z', description: '파티 참가 일시' })
	@CreateDateColumn({ name: 'joined_at' })
	joinedAt: Date;

	@ApiProperty({ example: null, description: '파티 탈퇴 일시' })
	@Column({ type: 'datetime', name: 'left_at', nullable: true })
	leftAt?: Date;
}
