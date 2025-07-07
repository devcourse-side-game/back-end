import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/constants/error-codes';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	/**
	 * 사용자 ID로 사용자 정보 조회
	 */
	async findById(id: number): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new AppException(ErrorCode.USER_NOT_FOUND);
		}
		return user;
	}

  /**
   * 사용자 프로필 조회
   */
  async getProfile(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }
    
    // 업데이트할 필드가 있는 경우에만 업데이트
    if (updateUserDto.username) {
      // 사용자 이름 중복 확인
      const existingUser = await this.usersRepository.findOne({ 
        where: { username: updateUserDto.username } 
      });
      if (existingUser && existingUser.id !== userId) {
        throw new UnauthorizedException('이미 사용 중인 사용자 이름입니다.');
      }
      user.username = updateUserDto.username;
    }
    
    if (updateUserDto.email) {
      // 이메일 중복 확인
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: updateUserDto.email } 
      });
      if (existingUser && existingUser.id !== userId) {
        throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
      }
      user.email = updateUserDto.email;
    }

    return this.usersRepository.save(user);
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    
    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD);
    }
    
    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    
    await this.usersRepository.save(user);
  }

  /**
   * 계정 삭제
   */
  async deleteAccount(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    await this.usersRepository.remove(user);
  }
}
