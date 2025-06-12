import { HttpException } from '@nestjs/common';
import { ErrorCode, ERROR_DETAILS } from '../constants/error-codes';

// 애플리케이션 전용 예외 클래스
// 오류 코드를 기반으로 일관된 형식의 예외를 생성
export class AppException extends HttpException {
  private readonly errorCode: ErrorCode;
  private readonly errors?: any;

  constructor(errorCode: ErrorCode, errors?: any) {
    const errorDetails = ERROR_DETAILS[errorCode];
    
    super(
      {
        statusCode: errorDetails.statusCode,
        errorCode: errorCode,
        message: errorDetails.message,
        detail: errorDetails.detail,
        errors: errors,
      },
      errorDetails.statusCode
    );
    
    this.errorCode = errorCode;
    this.errors = errors;
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }

  getErrors(): any {
    return this.errors;
  }
}
