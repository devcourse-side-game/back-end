import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(payload: any) {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
