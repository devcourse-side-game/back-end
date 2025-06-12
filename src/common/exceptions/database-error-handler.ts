import { QueryFailedError } from 'typeorm';
import { ErrorCode } from '../constants/error-codes';
import { AppException } from './app.exception';

// 데이터베이스 오류를 분석하여 적절한 AppException으로 변환
export function handleDatabaseError(error: QueryFailedError): AppException {
  // QueryFailedError 처리
  if (error instanceof QueryFailedError) {
    const errorMessage = error.message || '';
    
    // MySQL 유니크 제약 조건 위반 오류 처리
    if (errorMessage.includes('Duplicate entry')) {
      // email 중복 오류
      if (errorMessage.includes('email')) {
        return new AppException(ErrorCode.USER_ALREADY_EXISTS);
      };

      // 기타 중복 오류
      return new AppException(ErrorCode.DATABASE_ERROR, {
        originalError: process.env.NODE_ENV === 'production' ? undefined : errorMessage
      });
    }
    // 외래 키 제약 조건 위반 오류
  }
  
  // 기타 데이터베이스 오류
  return new AppException(ErrorCode.DATABASE_ERROR, {
    originalError: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
}

