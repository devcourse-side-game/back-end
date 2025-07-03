import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || 'gamePartySecretKey',
		});
	}

	async validate(payload: any) {
		try {
			const { email } = payload;

			const user = await this.userRepository.findOneBy({ email });

			if (!user) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}

			return { id: user.id, email: user.email };
		} catch (error) {
			// 토큰 만료 오류 처리
			if (error.name === 'TokenExpiredError') {
				throw new AppException(ErrorCode.ACCESS_TOKEN_EXPIRED);
			}
			
			// 토큰 검증 오류 처리
			if (error.name === 'JsonWebTokenError') {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}
			
			// 기타 오류는 그대로 전파
			throw error;
		}
	}

	/* 사용자 찾기 */
	async findUserId(email: string): Promise<User | null> {
		return await this.userRepository.findOne({
				where: { email: email }
			});
	}
}