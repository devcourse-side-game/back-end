import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';

@Entity('likes')
@Unique(['givenUserId', 'receivedUserId']) // Ensure a user can only like another user once
export class Like {
	@ApiProperty({ description: 'Like ID', example: 1 })
	@PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
	id: number;

	@ApiProperty({ description: 'ID of the user who gave the like', example: 1 })
	@Column({ name: 'given_user_id', nullable: false, type: 'integer' })
	givenUserId: number;

	@ApiProperty({ description: 'ID of the user who received the like', example: 2 })
	@Column({ name: 'received_user_id', nullable: false, type: 'integer' })
	receivedUserId: number;

	@ApiProperty({
		description: 'The time the like was created',
		example: '2023-01-01T00:00:00.000Z',
	})
	@CreateDateColumn({ name: 'created_at', type: 'datetime' })
	createdAt: Date;

	/* Relationships */
	@ManyToOne(() => User)
	@JoinColumn({ name: 'given_user_id', referencedColumnName: 'id' })
	givenUser: User;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'received_user_id', referencedColumnName: 'id' })
	receivedUser: User;
}
