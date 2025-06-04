import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinPrivatePartyDto {
  @ApiProperty({ example: '1234', description: '접근 코드' })
  @IsNotEmpty({ message: '접근 코드는 필수입니다.' })
  @IsString()
  @MaxLength(20, { message: '접근 코드는 20자를 초과할 수 없습니다.' })
  accessCode: string;
}
