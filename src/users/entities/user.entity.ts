import { ApiProperty } from '@nestjs/swagger';
import { Party } from '../../parties/entities/party.entity';
import { Like } from '../../likes/entities/like.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
	@ApiProperty({ description: 'user ID', example: 1 })
	@PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
	id: number;

	@ApiProperty({ description: 'user name', example: 'user1' })
	@Column({ nullable: false, unique: true, type: 'varchar', length: 10 })
	username: string;

	@ApiProperty({ description: 'user password', example: 'password1' })
	@Column({ nullable: false, type: 'varchar', length: 100 })
	password: string;

	@ApiProperty({ description: 'user email', example: 'user1@gmail.com' })
	@Column({ nullable: true, unique: true, type: 'varchar', length: 50 })
	email: string;

	@ApiProperty({ description: 'user profile image', example: 'https://example.com/profile.jpg' })
	@Column({ nullable: true, type: 'varchar', length: 255, name: 'profile_image' })
	profileImage: string;

	@ApiProperty({
		description: 'The time the user created the party',
		example: '2023-01-01T00:00:00.000Z',
	})
	@CreateDateColumn({ name: 'created_at', type: 'datetime' })
	createdAt: Date;

	@ApiProperty({
		description: 'The time the user updated the party',
		example: '2023-01-01T00:00:00.000Z',
	})
	@UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
	updatedAt: Date;

	@ApiProperty({ description: 'Refresh token for authentication', required: false })
	@Column({ nullable: true, type: 'varchar', length: 500, name: 'refresh_token' })
	refreshToken: string;

	/* 관계 */
	@OneToMany(() => Party, (party) => party.creator)
	createdParties: Party[];

	@OneToMany(() => Like, (like) => like.givenUser)
	givenLikes: Like[];

	@OneToMany(() => Like, (like) => like.receivedUser)
	receivedLikes: Like[];
}
