import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePartyDto {
  @ApiProperty({ example: '로스트아크 발탄 하드 파티 모집 (수정)', description: '파티 제목', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '파티 제목은 100자를 초과할 수 없습니다.' })
  title?: string;

  @ApiProperty({ example: 1, description: '게임 ID', required: false })
  @IsOptional()
  @IsInt({ message: '게임 ID는 정수여야 합니다.' })
  gameId?: number;

  @ApiProperty({ example: '레이드', description: '목적 태그', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '목적 태그는 50자를 초과할 수 없습니다.' })
  purposeTag?: string;

  @ApiProperty({ example: 8, description: '최대 참가자 수', required: false })
  @IsOptional()
  @IsInt({ message: '최대 참가자 수는 정수여야 합니다.' })
  @Min(2, { message: '최대 참가자 수는 2명 이상이어야 합니다.' })
  maxParticipants?: number;

  @ApiProperty({ example: '2025-06-10T18:00:00', description: '시작 시간', required: false })
  @IsOptional()
  @IsISO8601() // ISO 8601 형식의 날짜 문자열인지 검증
  @Type(() => Date) // 문자열을 Date 객체로 변환
  startTime?: Date;

  @ApiProperty({ example: '2025-06-10T20:00:00', description: '종료 시간', required: false })
  @IsOptional()
  @IsISO8601() // ISO 8601 형식의 날짜 문자열인지 검증
  @Type(() => Date) // 문자열을 Date 객체로 변환
  endTime?: Date;

  @ApiProperty({ example: '로스트아크 발탄 하드 파티 모집합니다. 8인 레이드 입니다. (수정)', description: '파티 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, description: '비공개 파티 여부', required: false })
  @IsOptional()
  @IsBoolean({ message: '비공개 파티 여부는 불리언 값이어야 합니다.' })
  isPrivate?: boolean;

  @ApiProperty({ example: '5678', description: '접근 코드 (비공개 파티인 경우)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '접근 코드는 20자를 초과할 수 없습니다.' })
  accessCode?: string;
  
  @ApiProperty({ example: true, description: '완료 여부', required: false })
  @IsOptional()
  @IsBoolean({ message: '완료 여부는 불리언 값이어야 합니다.' })
  isCompleted?: boolean;
}