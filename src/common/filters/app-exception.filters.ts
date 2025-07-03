import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { handleDatabaseError } from "../exceptions/database-error-handler";

@Catch(HttpException, QueryFailedError, Error)
export class AppExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException | QueryFailedError | Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        // 응답이 이미 전송되었는지 확인
        if (response.headersSent) {
            console.error('Headers already sent', exception);
            return;
        }

        // 데이터베이스 오류 처리 (QueryFailedError)
        if (exception instanceof QueryFailedError) {
            const appException = handleDatabaseError(exception);
            const exceptionResponse = appException.getResponse() as any;
            const {errors, ...restExceptionResponse} = exceptionResponse;
            
            return response.status(appException.getStatus()).json({
              success: false,
              ...restExceptionResponse,
              timestamp: new Date().toISOString(),
              path: request.url
            });
        }

        // HttpException 처리 (AppException 포함)
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as any;

            const errorResponse: any = {
                success: false,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                detail: process.env.NODE_ENV === 'production' ? undefined : exception.message
            };

            // 메시지 처리
            if (typeof exceptionResponse === 'string') {
                errorResponse.message = exceptionResponse;
            } else {
                // 오류 코드가 있는 경우 (AppException)
                if (exceptionResponse.errorCode) {
                    errorResponse.errorCode = exceptionResponse.errorCode;
                }
                // 메시지 추가
                errorResponse.message = exceptionResponse.message || '오류가 발생했습니다.';
            
                // 상세 정보가 있는 경우 추가
                if (exceptionResponse.detail) {
                    errorResponse.detail = exceptionResponse.detail;
                }
            
                // 유효성 검사 오류가 있는 경우 추가
                if (exceptionResponse.errors) {
                    errorResponse.errors = exceptionResponse.errors;
                }
            }

            return response.status(status).json(errorResponse);
        }

        // 일반 Error 처리
        if (exception instanceof Error) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '서버 내부 오류가 발생했습니다.',
                timestamp: new Date().toISOString(),
                path: request.url,
                detail: process.env.NODE_ENV === 'production' ? undefined : exception.message
            });
        }
    }
}