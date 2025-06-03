import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  UpdateUserDto,
  ChangePasswordDto,
  UserProfileResponseDto,
  UpdateProfileResponseDto,
  ChangePasswordResponseDto,
  DeleteAccountResponseDto,
  UsersErrorResponseDto
} from '../dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
    ) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '내 정보 조회', description: '로그인한 사용자 정보 조회' })
    @ApiResponse({ status: 200, description: '사용자 정보 조회 성공', type: UserProfileResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
    async getProfile(@Req() req: Request) {
        // 실제 구현에서는 JWT에서 사용자 ID를 추출하여 사용자 정보를 조회해야 함
        // 비밀번호 필드 제외하고 반환
        return { message: '사용자 정보 조회 성공' };
    }

    @Put('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '내 정보 수정', description: '사용자 정보 업데이트' })
    @ApiResponse({ status: 200, description: '사용자 정보 수정 성공', type: UpdateProfileResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
    async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
        return { message: '사용자 정보 수정 성공' };
    }

    @Put('me/password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '비밀번호 변경', description: '사용자 비밀번호 변경' })
    @ApiResponse({ status: 200, description: '비밀번호 변경 성공', type: ChangePasswordResponseDto })
    @ApiResponse({ status: 401, description: '현재 비밀번호가 일치하지 않음', type: UsersErrorResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
    async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
        return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '계정 삭제', description: '사용자 계정 삭제' })
    @ApiResponse({ status: 200, description: '계정 삭제 성공', type: DeleteAccountResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음', type: UsersErrorResponseDto })
    async deleteAccount(@Req() req: Request) {
        return { message: '계정이 성공적으로 삭제되었습니다.' };
    }
}