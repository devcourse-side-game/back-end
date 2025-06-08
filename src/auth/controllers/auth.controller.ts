import { Body, Controller, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
	LoginDto,
	RegisterDto,
	LoginResponseDto,
	RegisterResponseDto,
	LogoutResponseDto,
	AuthErrorResponseDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorator/get-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(201)
	@ApiOperation({ summary: '회원가입', description: '새 사용자 계정 생성' })
	@ApiResponse({ status: 201, description: '회원가입 성공', type: RegisterResponseDto })
	@ApiResponse({ status: 409, description: '이미 존재하는 사용자명', type: AuthErrorResponseDto })
	async register(@Body() registerDto: RegisterDto) {
		return await this.authService.register(registerDto);
	}

	@Post('login')
	@ApiOperation({ summary: '로그인', description: '사용자 인증 및 토큰 발급' })
	@ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponseDto })
	@ApiResponse({ status: 401, description: '인증 실패', type: AuthErrorResponseDto })
	async login(@Body() loginDto: LoginDto) {
		const { accessToken } = await this.authService.login(loginDto);

		return { message: '로그인 성공', accessToken };
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '로그아웃', description: '현재 세션 종료' })
	@ApiResponse({ status: 200, description: '로그아웃 성공', type: LogoutResponseDto })
	async logout(@GetUser() user: any) {
		// 클라이언트 측에서 토큰을 삭제하는 방식으로 구현
		// 서버 측에서는 추가 작업 없이 성공 응답만 반환
		return { message: '로그아웃 성공' };
	}
}