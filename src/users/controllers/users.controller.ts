import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import {
	UpdateUserDto,
	ChangePasswordDto,
	UserProfileResponseDto,
	UpdateProfileResponseDto,
	ChangePasswordResponseDto,
	DeleteAccountResponseDto,
	UsersErrorResponseDto,
	PasswordErrorResponseDto,
	UserAlreadyExistsResponseDto,
	EmailAlreadyExistsResponseDto,
} from '../dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@ApiOperation({ summary: '내 정보 조회', description: '로그인한 사용자 정보 조회' })
	@ApiResponse({
		status: 200,
		description: '사용자 정보 조회 성공',
		type: UserProfileResponseDto,
	})
	@ApiResponse({ status: 401, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
	async getProfile(@GetUser() jwtPayload: JwtPayload) {
		const userId = jwtPayload.id; // JWT에서 추출된 사용자 ID
		const user = await this.usersService.getProfile(userId);
		
		// 비밀번호 필드 제외하고 반환
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	@Put('me')
	@ApiOperation({ summary: '내 정보 수정', description: '사용자 정보 업데이트' })
	@ApiResponse({
		status: 200,
		description: '사용자 정보 수정 성공',
		type: UpdateProfileResponseDto,
	})
	@ApiResponse({ status: 401, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
	@ApiResponse({ status: 401, description: '이미 사용 중인 사용자 이름입니다.', type: UserAlreadyExistsResponseDto })
	@ApiResponse({ status: 409, description: '이미 존재하는 이메일입니다.', type: EmailAlreadyExistsResponseDto })
	async updateProfile(@GetUser() jwtPayload: JwtPayload, @Body() updateUserDto: UpdateUserDto) {
		const userId = jwtPayload.id; // JWT에서 추출된 사용자 ID
		await this.usersService.updateProfile(userId, updateUserDto);
		return { message: '사용자 정보 수정 성공' };
	}

	@Put('me/password')
	@ApiOperation({ summary: '비밀번호 변경', description: '사용자 비밀번호 변경' })
	@ApiResponse({
		status: 200,
		description: '비밀번호 변경 성공',
		type: ChangePasswordResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: '현재 비밀번호가 일치하지 않음',
		type: PasswordErrorResponseDto,
	})
	@ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
	async changePassword(
		@GetUser() jwtPayload: JwtPayload,
		@Body() changePasswordDto: ChangePasswordDto,
	) {
		const userId = jwtPayload.id; // JWT에서 추출된 사용자 ID
		await this.usersService.changePassword(userId, changePasswordDto);
		return { message: '비밀번호가 성공적으로 변경되었습니다.' };
	}

	@Delete('me')
	@ApiOperation({ summary: '계정 삭제', description: '사용자 계정 삭제' })
	@ApiResponse({ status: 200, description: '계정 삭제 성공', type: DeleteAccountResponseDto })
	@ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
	async deleteAccount(@GetUser() jwtPayload: JwtPayload) {
		const userId = jwtPayload.id; // JWT에서 추출된 사용자 ID
		await this.usersService.deleteAccount(userId);
		return { message: '계정이 성공적으로 삭제되었습니다.' };
	}
}
