import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

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
			const user = await this.findUserId(payload.email);

			if (!user) {
				throw new UnauthorizedException('접근 권한이 없습니다.');
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