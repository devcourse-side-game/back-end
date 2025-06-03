import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user123@gmail.com', description: '사용자 이메일일' })
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user123@gmail.com', description: '사용자 이메일' })
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  password: string;
}
