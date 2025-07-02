/**
 * 애플리케이션 전체에서 사용할 오류 코드 및 메시지 정의
 */
export interface ErrorDetails {
	statusCode: number;
	message: string;
	detail?: string;
}

export enum ErrorCode {
	// 사용자 관련 오류 (u-xxx)
	REPASSWORD_MISMATCH = 'u-001', // 비밀번호 확인이 일치하지 않음
	USER_ALREADY_EXISTS = 'u-002', // 이미 존재하는 아이디

	// 인증 관련 오류 (a-xxx)
	USER_NOT_FOUND = 'a-001', // 존재하지 않는 아이디
	INVALID_PASSWORD = 'a-002', // 비밀번호 불일치
	UNAUTHORIZED = 'a-003', // 인증되지 않은 사용자

	// 파티 관련 오류 (p-xxx)
	PARTY_NOT_FOUND = 'p-001', // 파티를 찾을 수 없음
	PARTY_ALREADY_JOINED = 'p-002', // 이미 참가한 파티
	PARTY_MAX_PARTICIPANTS = 'p-003', // 최대 인원 초과
	PARTY_INVALID_ACCESS_CODE = 'p-004', // 잘못된 접근 코드 또는 비공개 파티 접근 오류
	PARTY_LEADER_CANNOT_LEAVE = 'p-005', // 파티장은 탈퇴할 수 없음
	PARTY_MEMBER_NOT_FOUND = 'p-006', // 파티 멤버를 찾을 수 없음
	PARTY_NOT_LEADER = 'p-007', // 파티장이 아님
	PARTY_SELF_ACTION_NOT_ALLOWED = 'p-008', // 자기 자신에 대한 작업 불가
	PARTY_ALREADY_COMPLETED = 'p-009', // 이미 완료된 파티
	PARTY_NOT_CREATOR = 'p-010', // 파티 생성자가 아님

	// 게임 관련 오류 (gm-xxx)
	GAME_NOT_FOUND = 'gm-001', // 게임을 찾을 수 없음

	// 게임 프로필 관련 오류 (ugp-xxx)
	USER_GAME_PROFILE_NOT_FOUND = 'ugp-001',

	// 일반 오류 (g-xxx)
	VALIDATION_ERROR = 'g-001',
	DATABASE_ERROR = 'g-002',
	INTERNAL_SERVER_ERROR = 'g-003',
	FORBIDDEN = 'g-004', // 권한 없음
}

export const ERROR_DETAILS: Record<ErrorCode, ErrorDetails> = {
	// 사용자 관련 오류
	[ErrorCode.USER_ALREADY_EXISTS]: {
		statusCode: 409,
		message: '이미 존재하는 사용자 ID입니다.',
		detail: '다른 사용자 ID를 사용해주세요.',
	},
	[ErrorCode.USER_NOT_FOUND]: {
		statusCode: 404,
		message: '사용자를 찾을 수 없습니다.',
		detail: '존재하지 않는 사용자입니다.',
	},
	[ErrorCode.INVALID_PASSWORD]: {
		statusCode: 400,
		message: '비밀번호가 일치하지 않습니다.',
		detail: '비밀번호가 일치하지 않습니다.',
	},
	[ErrorCode.REPASSWORD_MISMATCH]: {
		statusCode: 400,
		message: '비밀번호가 일치하지 않습니다.',
		detail: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
	},
	[ErrorCode.UNAUTHORIZED]: {
		statusCode: 401,
		message: '인증이 필요합니다.',
		detail: '이 작업을 수행하려면 로그인이 필요합니다.',
	},

	// 파티 관련 오류
	[ErrorCode.PARTY_NOT_FOUND]: {
		statusCode: 404,
		message: '파티를 찾을 수 없습니다.',
		detail: '존재하지 않는 파티입니다.',
	},
	[ErrorCode.PARTY_ALREADY_JOINED]: {
		statusCode: 409,
		message: '이미 참가한 파티입니다.',
		detail: '한 번에 하나의 파티에만 참가할 수 있습니다.',
	},
	[ErrorCode.PARTY_MAX_PARTICIPANTS]: {
		statusCode: 400,
		message: '파티 최대 인원을 초과했습니다.',
		detail: '파티에 더 이상 참가할 수 없습니다.',
	},
	[ErrorCode.PARTY_INVALID_ACCESS_CODE]: {
		statusCode: 400,
		message: '접근 코드가 필요하거나 잘못되었습니다.',
		detail: '비공개 파티는 올바른 접근 코드가 필요합니다.',
	},
	[ErrorCode.PARTY_LEADER_CANNOT_LEAVE]: {
		statusCode: 403,
		message: '파티장은 파티를 떠날 수 없습니다.',
		detail: '파티장을 다른 멤버에게 위임한 후 떠나주세요.',
	},
	[ErrorCode.PARTY_MEMBER_NOT_FOUND]: {
		statusCode: 404,
		message: '파티 멤버를 찾을 수 없습니다.',
		detail: '해당 사용자는 이 파티의 멤버가 아닙니다.',
	},
	[ErrorCode.PARTY_NOT_LEADER]: {
		statusCode: 403,
		message: '파티장만 수행할 수 있는 작업입니다.',
		detail: '파티장 권한이 필요합니다.',
	},
	[ErrorCode.PARTY_SELF_ACTION_NOT_ALLOWED]: {
		statusCode: 400,
		message: '자기 자신에 대한 작업은 수행할 수 없습니다.',
		detail: '다른 멤버를 선택해주세요.',
	},
	[ErrorCode.PARTY_ALREADY_COMPLETED]: {
		statusCode: 400,
		message: '이미 완료된 파티입니다.',
		detail: '완료된 파티의 상태는 변경할 수 없습니다.',
	},
	[ErrorCode.PARTY_NOT_CREATOR]: {
		statusCode: 403,
		message: '파티 생성자만 수행할 수 있는 작업입니다.',
		detail: '파티 생성자 권한이 필요합니다.',
	},
	[ErrorCode.GAME_NOT_FOUND]: {
		statusCode: 404,
		message: '게임을 찾을 수 없습니다.',
		detail: '존재하지 않는 게임입니다.',
	},

	// 게임 프로필 관련 오류
	[ErrorCode.USER_GAME_PROFILE_NOT_FOUND]: {
		statusCode: 404,
		message: '사용자 게임 프로필을 찾을 수 없습니다.',
		detail: '해당 사용자의 게임 프로필이 존재하지 않습니다.',
	},

	// 일반 오류
	[ErrorCode.VALIDATION_ERROR]: {
		statusCode: 400,
		message: '입력 데이터가 유효하지 않습니다.',
	},
	[ErrorCode.DATABASE_ERROR]: {
		statusCode: 500,
		message: '데이터베이스 오류가 발생했습니다.',
	},
	[ErrorCode.INTERNAL_SERVER_ERROR]: {
		statusCode: 500,
		message: '서버 내부 오류가 발생했습니다.',
		detail: '요청을 처리하는 중에 예상치 못한 오류가 발생했습니다.',
	},
	[ErrorCode.FORBIDDEN]: {
		statusCode: 403,
		message: '요청을 수행할 권한이 없습니다.',
		detail: '이 리소스에 접근하거나 이 작업을 수행할 권한이 없습니다.',
	},
};
