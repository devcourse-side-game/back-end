import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, RefreshTokenDto, RegisterDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

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

		return this.generateTokens({ id: user.id, username: user.username, email: user.email });
	}
	
	/* 로그아웃 */
	async logout(userId: number) {
		// 리프레시 토큰 삭제 (null 대신 빈 문자열 사용)
		await this.userRepository.update(userId, { refreshToken: '' });
		return { message: '로그아웃 성공' };
	}

	/* 닉네임 중복 확인 */
	async nicknameCheck(nickname: string) {
		const user = await this.userRepository.findOneBy({ username: nickname });
		if (user) {
			throw new ConflictException('이미 존재하는 닉네임입니다.');
		}
		return { message: '사용 가능한 닉네임입니다.' };
	}

	/* 토큰 생성 (액세스 토큰 + 리프레시 토큰) */
	async generateTokens(payload: { id: number; username: string; email: string }) {
		// 액세스 토큰 생성
		const accessToken = this.jwtService.sign(payload, {
			audience: payload.email,
			expiresIn: process.env.JWT_EXPIRES_IN
		});

		// 리프레시 토큰 생성
		const refreshToken = this.jwtService.sign(payload, {
			audience: payload.email,
			expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
		});

		// 리프레시 토큰 데이터베이스에 저장
		await this.userRepository.update(payload.id, { refreshToken });

		return { accessToken, refreshToken };
	}

	/* 액세스 토큰 만 생성 */
	async generateAccessToken(payload: { id: number; username: string; email: string }) {
		return this.jwtService.sign(payload, {
			audience: payload.email,
			expiresIn: '15m'
		});
	}

	/* 리프레시 토큰으로 새 액세스 토큰 발급 */
	async refreshAccessToken(refreshTokenDto: RefreshTokenDto) {
		const { refreshToken } = refreshTokenDto;
		
		try {
			// 리프레시 토큰 검증
			const payload = this.jwtService.verify(refreshToken, {
				secret: process.env.JWT_SECRET || 'gamePartySecretKey'
			});
			
			// 사용자 조회
			const user = await this.userRepository.findOneBy({ email: payload.email });
			
			// 사용자가 없거나 리프레시 토큰이 데이터베이스에 저장된 값과 다르면 예외 발생
			if (!user || user.refreshToken !== refreshToken) {
				throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
			}
			
			// 새 액세스 토큰 발급
			const accessToken = await this.generateAccessToken({ 
				id: user.id, 
				username: user.username, 
				email: user.email 
			});
			
			return { 
				message: '새로운 액세스 토큰이 발급되었습니다.', 
				accessToken 
			};
		} catch (error) {
			// 리프레시 토큰 검증 오류
			if (error.name === 'JsonWebTokenError') {
				throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
			}

			// JWT 검증 오류 처리
			if (error.name === 'TokenExpiredError') {
				throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
			}
			
			// 기타 오류
			throw error;
		}
	}
}
