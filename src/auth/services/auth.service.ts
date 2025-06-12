import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,

		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	/* 회원가입 */
	async register(registerDto: RegisterDto) {
		const { email, password, username } = registerDto;

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.userRepository.create({
			username: username,
			email: email,
			password: hashedPassword,
		})

		// 중복 이메일, 유저명이 있다면 DB에러 발생 => 예외 처리 커스텀 필요
		// 사전 검증 방식으로 전환하는 것을 고려할 수 있음
		await this.userRepository.save(user);

		return { message: '회원가입이 완료되었습니다.' };
	}

	/* 로그인 */
	async login(loginDto: LoginDto) {
		const { email, password } = loginDto;

		const user = await this.userRepository.findOneBy({ email });
		if (!user) {
			throw new UnauthorizedException('인증에 실패했습니다.');
		}

		const isPasswordMatched = await bcrypt.compare(password, user.password);
		if (!isPasswordMatched) {
			throw new UnauthorizedException('인증에 실패했습니다.');
		}

		return this.generateToken({ id: user.id, username: user.username, email: user.email });
	}

	/* 토큰 생성 */
	async generateToken(payload: { id: number; username: string; email: string }) {
		const accessToken = this.jwtService.sign(payload, {
			audience: payload.email,
		});

		return { accessToken };
	}
}
