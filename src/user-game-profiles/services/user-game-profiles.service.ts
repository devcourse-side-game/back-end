import { In } from 'typeorm';
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

	/**
	 * 여러 프로필 ID로 UserGameProfile 목록을 조회합니다.
	 * @param profileIds number[]
	 * @returns UserGameProfile[]
	 */
	async getProfilesByIds(profileIds: number[]): Promise<UserGameProfile[]> {
		if (!profileIds.length) return [];
		return this.userGameProfileRepository.find({ where: { id: In(profileIds) } });
	}

	async getUserGameProfiles(userId: number): Promise<UserGameProfileDto[]> {
		const profiles = await this.userGameProfileRepository.find({
			where: { userId },
			relations: ['game'],
		});

		if (!profiles || profiles.length === 0) {
			throw new AppException(ErrorCode.USER_GAME_PROFILE_NOT_FOUND);
		}

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

	async getUserGameProfileByUsername(
		userId: number,
		gameId: number,
		gameUsername: string,
	): Promise<UserGameProfileDto> {
		const profile = await this.userGameProfileRepository.findOne({
			where: { userId, gameId, gameUsername },
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

	async getUserGameProfilesByGame(userId: number, gameId: number): Promise<UserGameProfileDto[]> {
		const profiles = await this.userGameProfileRepository.find({
			where: { userId, gameId },
			relations: ['game'],
		});

		if (!profiles || profiles.length === 0) {
			throw new AppException(ErrorCode.USER_GAME_PROFILE_NOT_FOUND);
		}

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

	async findOrCreateUserGameProfile(
		userId: number,
		gameId: number,
		username: string,
	): Promise<UserGameProfile> {
		if (!username || username.trim() === '') {
			throw new AppException(
				ErrorCode.VALIDATION_ERROR,
				'게임 프로필 username이 필요합니다.',
			);
		}

		// 동일한 userId, gameId, gameUsername 조합이 있는지 확인
		let userGameProfile = await this.userGameProfileRepository.findOne({
			where: { userId, gameId, gameUsername: username },
		});

		if (!userGameProfile) {
			userGameProfile = this.userGameProfileRepository.create({
				userId,
				gameId,
				gameUsername: username,
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

	// UserGameProfilesService에 추가: ID로 프로필 조회 (userId, gameId 일치까지 검증)
	async getUserGameProfileById(
		profileId: number,
		userId: number,
		gameId: number,
	): Promise<UserGameProfile | null> {
		return this.userGameProfileRepository.findOne({
			where: { id: profileId, userId, gameId },
		});
	}

	// 새로운 메서드: profileId만으로 조회 (검증 없음)
	async getProfileById(profileId: number): Promise<UserGameProfile | null> {
		return this.userGameProfileRepository.findOne({
			where: { id: profileId },
		});
	}
}
