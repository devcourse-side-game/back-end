import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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

		const existingUser = await this.userRepository.findOneBy({ email });
		if (existingUser) {
			throw new ConflictException('이미 존재하는 이메일입니다.');
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.userRepository.create({
			username: username,
			email: email,
			password: hashedPassword,
		})

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

	/* 닉네임 중복 확인 */
	async nicknameCheck(nickname: string) {
		const user = await this.userRepository.findOneBy({ username: nickname });
		if (user) {
			throw new ConflictException('이미 존재하는 닉네임입니다.');
		}
		return { message: '사용 가능한 닉네임입니다.' };
	}

	/* 토큰 생성 */
	async generateToken(payload: { id: number; username: string; email: string }) {
		const accessToken = this.jwtService.sign(payload, {
			audience: payload.email,
		});

		return { accessToken };
	}
}
