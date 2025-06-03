import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '사용자 이름', example: 'user123', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;
  
  @ApiProperty({ description: '이메일', example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
