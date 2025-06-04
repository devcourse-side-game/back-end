import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('parties')
export class Party {
    @ApiProperty({ example: 1, description: '파티 ID' })
    @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
    id: number;

    @ApiProperty({ example: '로스트아크 발탄 하드 파티 모집', description: '파티 제목' })
    @Column({ nullable: false, unique: true, type: 'varchar', length: 100 })
    title: string;

    @ApiProperty({ example: 1, description: '게임 ID' })
    @Column({ nullable: false, type: 'integer', name: 'game_id' })
    gameId: number; // FK

    @ApiProperty({ example: 1, description: '생성자 ID' })
    @Column({ nullable: false, type: 'integer', name: 'creator_id' })
    creatorId: number; // FK

    @ApiProperty({ example: '레이드', description: '목적 태그' })
    @Column({ nullable: false, unique: true, type: 'varchar', length: 50, name: 'purpose_tag' })
    purposeTag: string;

    @ApiProperty({ example: 8, description: '최대 참가자 수' })
    @Column({ nullable: false, type: 'integer', name: 'max_participants' })
    maxParticipants: number;

    @ApiProperty({ example: '2025-06-10T18:00:00', description: '시작 시간' })
    @Column({ type: 'datetime', name: 'start_time' })
    startTime: Date;

    @ApiProperty({ example: '2025-06-10T20:00:00', description: '종료 시간' })
    @Column({ type: 'datetime', name: 'end_time' })
    endTime: Date;

    @ApiProperty({ example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다.', description: '파티 설명' })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ example: false, description: '비공개 파티 여부' })
    @Column({ nullable: false, type: 'boolean', name: 'is_private' })
    isPrivate: boolean;

    @ApiProperty({ example: '1234', description: '접근 코드 (비공개 파티인 경우)', required: false })
    @Column({ nullable: true, type: 'varchar', length: 20, name: 'access_code' })
    accessCode: string;

    @ApiProperty({ example: false, description: '완료 여부' })
    @Column({ nullable: false, type: 'boolean', name: 'is_completed' })
    isCompleted: boolean;

    @ApiProperty({ example: '2025-06-10T18:00:00', description: '게시글 생성 시간' })
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @ApiProperty({ example: '2025-06-10T18:00:00', description: '게시글 수정 시간' })
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    /* 관계 */
    @ManyToOne(() => User, user => user.createdParties)
    @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
    creator: User;
}