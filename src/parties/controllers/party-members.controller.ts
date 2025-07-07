import {
	Controller,
	Post,
	UseGuards,
	Param,
	ParseIntPipe,
	Get,
	Body,
	Delete,
	Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
	ApiTags,
	ApiOperation,
	ApiOkResponse,
	ApiBearerAuth,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import { PartyMembersService } from '../services/party-members.service';
import { JoinPartyDto } from '../dto/join-party.dto';
import { MemberListResponseDto } from '../dto/response.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/constants/error-codes';

@ApiTags('partyMembers')
@Controller('parties/:partyId/members')
export class PartyMembersController {
	constructor(private readonly partyMembersService: PartyMembersService) {}

	@Post()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '파티 참가 (공개/비공개 통합)' })
	@ApiOkResponse({
		description: '파티에 참가했습니다.',
		schema: { example: { message: 'user1님이 파티에 참가했습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '이미 참가한 파티, 최대 인원 초과, 또는 잘못된 접근 코드 등의 오류입니다.',
		schema: {
			example: {
				success: false,
				statusCode: 400,
				errorCode: 'p-004',
				message: '접근 코드가 필요하거나 잘못되었습니다.',
				detail: '비공개 파티는 올바른 접근 코드가 필요합니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/members',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증되지 않은 사용자입니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 401,
					errorCode: 'a-002',
					message: '인증되지 않은 사용자입니다.',
					detail: '유효한 인증 토큰이 제공되지 않았습니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 404,
					errorCode: 'p-001',
					message: '파티를 찾을 수 없습니다.',
				},
			},
		},
	})
	async joinParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
		@Body() dto: JoinPartyDto,
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.joinParty(partyId, user.id, dto);
		return { message: `${username}님이 파티에 참가했습니다.` };
	}

	@Delete()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '파티 탈퇴' })
	@ApiOkResponse({
		description: '파티에서 탈퇴했습니다.',
		schema: { example: { message: 'user1님이 파티에서 탈퇴했습니다.' } },
	})
	@ApiForbiddenResponse({
		description: '파티장은 탈퇴할 수 없습니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 403,
					errorCode: 'p-005',
					message: '파티장은 파티를 떠날 수 없습니다.',
					detail: '파티장을 다른 멤버에게 위임한 후 떠나주세요.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members',
				},
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증되지 않은 사용자입니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 401,
					errorCode: 'a-002',
					message: '인증되지 않은 사용자입니다.',
					detail: '유효한 인증 토큰이 제공되지 않았습니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티 멤버를 찾을 수 없습니다. (파티에 참가하지 않은 경우)',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 404,
					errorCode: 'p-006',
					message: '파티 멤버를 찾을 수 없습니다.',
					detail: '해당 사용자는 이 파티의 멤버가 아닙니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members',
				},
			},
		},
	})
	async leaveParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		if (!user || !user.id) {
			// @GetUser() 데코레이터가 어떤 이유로든 유효한 user 객체를 반환하지 못하는 경우에 대한 방어 코드
			throw new AppException(ErrorCode.UNAUTHORIZED);
		}
		const { username } = await this.partyMembersService.leaveParty(partyId, user.id);
		return { message: `${username}님이 파티에서 탈퇴했습니다.` };
	}

	@Get()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '파티 멤버 목록 조회' })
	@ApiOkResponse({ description: '파티 멤버 목록을 반환합니다.', type: MemberListResponseDto })
	@ApiUnauthorizedResponse({
		description: '인증되지 않은 사용자입니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 401,
					errorCode: 'a-002',
					message: '인증되지 않은 사용자입니다.',
					detail: '유효한 인증 토큰이 제공되지 않았습니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 404,
					errorCode: 'p-001',
					message: '파티를 찾을 수 없습니다.',
				},
			},
		},
	})
	getPartyMembers(
		@Param('partyId', ParseIntPipe) partyId: number,
	): Promise<MemberListResponseDto> {
		return this.partyMembersService.getPartyMembers(partyId);
	}

	@Delete('/:userId')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '파티원 강퇴 (파티장만)' })
	@ApiOkResponse({
		description: '파티원을 강퇴했습니다.',
		schema: { example: { message: 'user2님을 강퇴했습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '자기 자신을 강퇴할 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 400,
				errorCode: 'p-008',
				message: '자기 자신을 강퇴할 수 없습니다.',
				detail: '파티장은 자기 자신을 강퇴할 수 없습니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/members/1',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증되지 않은 사용자입니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 401,
					errorCode: 'a-002',
					message: '인증되지 않은 사용자입니다.',
					detail: '유효한 인증 토큰이 제공되지 않았습니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members/2',
				},
			},
		},
	})
	@ApiForbiddenResponse({
		description: '파티장만 강퇴할 수 있습니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 403,
					errorCode: 'p-002',
					message: '파티장만 이 작업을 수행할 수 있습니다.',
					detail: '오직 파티장만 멤버를 강퇴할 수 있습니다.',
					timestamp: '2025-06-30T12:00:00.000Z',
					path: '/parties/1/members/2',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티나 멤버를 찾을 수 없습니다.',
		content: {
			'application/json': {
				examples: {
					'파티 없음': {
						value: {
							success: false,
							statusCode: 404,
							errorCode: 'p-001',
							message: '파티를 찾을 수 없습니다.',
							timestamp: '2025-07-03T10:00:00.000Z',
							path: '/parties/999/members/2',
						},
					},
					'멤버 없음': {
						value: {
							success: false,
							statusCode: 404,
							errorCode: 'p-009',
							message: '해당 유저는 파티 멤버가 아닙니다.',
							timestamp: '2025-07-03T10:00:00.000Z',
							path: '/parties/1/members/999',
						},
					},
				},
			},
		},
	})
	async kickMember(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Param('userId', ParseIntPipe) userId: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.kickMember(partyId, user.id, userId);
		return { message: `${username}님을 강퇴했습니다.` };
	}

	@Put('/leader/:userId')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: '파티장 권한 이양 (파티장만)' })
	@ApiOkResponse({
		description: '파티장을 변경했습니다.',
		schema: { example: { message: 'user2님이 파티장으로 변경되었습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '자기 자신에게 권한을 이양할 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 400,
				errorCode: 'p-010',
				message: '자기 자신에게 권한을 이양할 수 없습니다.',
				detail: '파티장은 자기 자신에게 리더 권한을 넘길 수 없습니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/leader/1',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증되지 않은 사용자입니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 401,
					errorCode: 'a-002',
					message: '인증되지 않은 사용자입니다.',
					detail: '유효한 인증 토큰이 제공되지 않았습니다.',
					timestamp: '2025-07-03T10:00:00.000Z',
					path: '/parties/1/members/leader',
				},
			},
		},
	})
	@ApiForbiddenResponse({
		description: '파티장만 위임할 수 있습니다.',
		content: {
			'application/json': {
				example: {
					success: false,
					statusCode: 403,
					errorCode: 'p-002',
					message: '파티장만 이 작업을 수행할 수 있습니다.',
					detail: '오직 파티장만 리더를 변경할 수 있습니다.',
					timestamp: '2025-06-30T12:00:00.000Z',
					path: '/parties/1/members/leader',
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티나 멤버를 찾을 수 없습니다.',
		content: {
			'application/json': {
				examples: {
					'파티 없음': {
						value: {
							success: false,
							statusCode: 404,
							errorCode: 'p-001',
							message: '파티를 찾을 수 없습니다.',
							timestamp: '2025-07-03T10:00:00.000Z',
							path: '/parties/999/members/leader',
						},
					},
					'멤버 없음': {
						value: {
							success: false,
							statusCode: 404,
							errorCode: 'p-009',
							message: '해당 유저는 파티 멤버가 아닙니다.',
							timestamp: '2025-07-03T10:00:00.000Z',
							path: '/parties/1/members/leader',
						},
					},
				},
			},
		},
	})
	async changeLeader(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Param('userId', ParseIntPipe) newLeaderId: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.changeLeader(
			partyId,
			user.id,
			newLeaderId,
		);
		return { message: `${username}님이 파티장으로 변경되었습니다.` };
	}
}
