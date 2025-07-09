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
			secretOrKey: process.env.JWT_SECRET ?? 'gamePartySecretKey',
		});
	}

	/**
	 * validate메서드는 토큰의 유효성을 검사하는 것이 아닌, 토큰이 유효하다면 토큰에 포함된 사용자 정보를 반환하는 역할을 합니다.
	 */
	async validate(payload: any) {
		try {
			const { email } = payload;

			const user = await this.userRepository.findOneBy({ email });

			if (!user) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}

			return { id: user.id, email: user.email };

		} catch (error) {
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