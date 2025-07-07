import { Body, Controller, Get, HttpCode, Post, Query, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
	LoginDto,
	RegisterDto,
	LoginResponseDto,
	RegisterResponseDto,
	LogoutResponseDto,
	AuthErrorResponseDto,
	NicknameCheckResponseDto,
	NicknameCheckErrorResponseDto,
	RefreshTokenDto,
	RefreshTokenResponseDto,
	TokenErrorResponseDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorator/get-user.decorator';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/constants/error-codes';
import { ref } from 'process';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(201)
	@ApiOperation({ summary: '회원가입', description: '새 사용자 계정 생성' })
	@ApiResponse({ status: 201, description: '회원가입이 완료되었습니다.', type: RegisterResponseDto })
	@ApiResponse({ status: 409, description: '이미 존재하는 이메일입니다.', type: NicknameCheckErrorResponseDto })
	async register(@Body() registerDto: RegisterDto) {
		return await this.authService.register(registerDto);
	}

	@Post('login')
	@HttpCode(200)
	@ApiOperation({ summary: '로그인', description: '사용자 인증 및 토큰 발급' })
	@ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponseDto })
	@ApiResponse({ status: 401, description: '인증 실패', type: AuthErrorResponseDto })
	async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
		const { accessToken, refreshToken } = await this.authService.login(loginDto);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: false,
			path: '/api/auth/refresh',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
		});

		return { message: '로그인 성공', accessToken };
	}

	@Post('logout')
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '로그아웃', description: '현재 세션 종료 및 리프레시 토큰 무효화' })
	@ApiResponse({ status: 200, description: '로그아웃 성공', type: LogoutResponseDto })
	async logout(@GetUser() user: any) {
		// 리프레시 토큰 삭제
		return await this.authService.logout(user.id);
	}
	
	@Post('refresh')
	@HttpCode(200)
	@ApiOperation({ summary: '액세스 토큰 갱신', description: '리프레시 토큰을 사용하여 새 액세스 토큰 발급' })
	@ApiResponse({ status: 200, description: '토큰 갱신 성공', type: RefreshTokenResponseDto })
	@ApiResponse({ status: 401, description: '리프레시 토큰 유효하지 않음', type: TokenErrorResponseDto })
	@ApiCookieAuth('refreshToken')
	async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.refreshToken;
		if (!refreshToken) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

		try {
			return await this.authService.refreshAccessToken({refreshToken});
		} catch (error) {
			// 리프레시 토큰 만료 시 쿠키 삭제
			if (error instanceof AppException && error.getResponse()['errorCode'] === ErrorCode.REFRESH_TOKEN_EXPIRED) {
				// 쿠키 삭제
				res.clearCookie('refreshToken', {
					httpOnly: true,
					secure: false,
					path: '/api/auth/refresh',
					sameSite: 'strict'
				});
				
				// 에러는 그대로 전파하여 클라이언트에게 만료 메시지 전달
				throw error;
			}
			throw error;
		}
	}

	@Get('nicknameCheck')
	@ApiOperation({ summary: '닉네임 중복 확인', description: '닉네임 중복 확인' })
	@ApiResponse({ status: 200, description: '닉네임 중복 확인 성공', type: NicknameCheckResponseDto })
	@ApiResponse({ status: 409, description: '닉네임 중복', type: NicknameCheckErrorResponseDto })
	@ApiQuery({ name: 'nickname', description: '닉네임', required: true })
	async nicknameCheck(@Query('nickname') nickname: string) {
		return await this.authService.nicknameCheck(nickname);
	}
}