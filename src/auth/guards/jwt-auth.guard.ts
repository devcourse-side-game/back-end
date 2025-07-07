import { ExecutionContext, Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode } from 'src/common/constants/error-codes';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        // 토큰 관련 오류 처리
        if (info instanceof TokenExpiredError) {
            throw new AppException(ErrorCode.ACCESS_TOKEN_EXPIRED);
        }
      
        if (info instanceof JsonWebTokenError) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 기본 오류 처리
        if (err || !user) {
            throw err || new AppException(ErrorCode.UNAUTHORIZED);
        }

        return user;
    }
}
