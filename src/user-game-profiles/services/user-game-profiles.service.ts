import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameProfile } from '../entities/user-game-profile.entity';
import { UserGameProfileDto } from '../dto/user-game-profile.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@Injectable()
export class UserGameProfilesService {
	constructor(
		@InjectRepository(UserGameProfile)
		private readonly userGameProfileRepository: Repository<UserGameProfile>,
	) {}

	async getUserGameProfiles(userId: number): Promise<UserGameProfileDto[]> {
		const profiles = await this.userGameProfileRepository.find({
			where: { userId },
			relations: ['game'],
		});

		return profiles.map((profile) => {
			const dto = new UserGameProfileDto();
			dto.id = profile.id;
			dto.userId = profile.userId;
			dto.gameId = profile.gameId;
			dto.gameUsername = profile.gameUsername;
			dto.game = profile.game;
			return dto;
		});
	}

	async getUserGameProfile(userId: number, gameId: number): Promise<UserGameProfileDto> {
		const profile = await this.userGameProfileRepository.findOne({
			where: { userId, gameId },
			relations: ['game'],
		});

		if (!profile) {
			throw new AppException(ErrorCode.USER_GAME_PROFILE_NOT_FOUND);
		}

		const dto = new UserGameProfileDto();
		dto.id = profile.id;
		dto.userId = profile.userId;
		dto.gameId = profile.gameId;
		dto.gameUsername = profile.gameUsername;
		dto.game = profile.game;
		return dto;
	}

	async findOrCreateUserGameProfile(
		userId: number,
		gameId: number,
		username: string,
	): Promise<UserGameProfile> {
		let userGameProfile = await this.userGameProfileRepository.findOne({
			where: { userId, gameId },
		});

		if (!userGameProfile) {
			userGameProfile = this.userGameProfileRepository.create({
				userId,
				gameId,
				gameUsername: username, // 기본값으로 유저네임 사용
			});
			await this.userGameProfileRepository.save(userGameProfile);
		}

		return userGameProfile;
	}

	async getGameProfilesForUsers(
		userGameInfos: { userId: number; gameId: number }[],
	): Promise<Map<string, string>> {
		if (userGameInfos.length === 0) {
			return new Map();
		}

		const userGameProfiles = await this.userGameProfileRepository
			.createQueryBuilder('profile')
			.where(
				userGameInfos
					.map(
						(_, i) =>
							`(profile.userId = :userId_${i} AND profile.gameId = :gameId_${i})`,
					)
					.join(' OR '),
			)
			.setParameters(
				userGameInfos.reduce(
					(params, info, i) => ({
						...params,
						[`userId_${i}`]: info.userId,
						[`gameId_${i}`]: info.gameId,
					}),
					{},
				),
			)
			.getMany();

		return new Map(userGameProfiles.map((p) => [`${p.userId}-${p.gameId}`, p.gameUsername]));
	}
}
