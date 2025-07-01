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

@ApiTags('PartyMembers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parties/:partyId/members')
export class PartyMembersController {
	constructor(private readonly partyMembersService: PartyMembersService) {}

	@Post()
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
		description: '인증이 필요합니다.',
		schema: { example: { statusCode: 401, message: 'Unauthorized' } },
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 404,
				errorCode: 'p-001',
				message: '파티를 찾을 수 없습니다.',
			},
		},
	})
	async joinParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
		@Body() dto?: JoinPartyDto,
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.joinParty(
			partyId,
			user.id,
			dto?.accessCode,
		);
		return { message: `${username}님이 파티에 참가했습니다.` };
	}

	@Post('/leave')
	@ApiOperation({ summary: '파티 탈퇴' })
	@ApiOkResponse({
		description: '파티에서 탈퇴했습니다.',
		schema: { example: { message: 'user1님이 파티에서 탈퇴했습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '파티장은 탈퇴할 수 없습니다.',
		schema: {
			example: {
				statusCode: 400,
				message: '파티장은 탈퇴할 수 없습니다.',
				error: 'Bad Request',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: { example: { statusCode: 401, message: 'Unauthorized' } },
	})
	@ApiNotFoundResponse({
		description: '파티에 참가하지 않았습니다.',
		schema: {
			example: {
				statusCode: 404,
				message: '파티에 참가하지 않았습니다.',
				error: 'Not Found',
			},
		},
	})
	async leaveParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.leaveParty(partyId, user.id);
		return { message: `${username}님이 파티에서 탈퇴했습니다.` };
	}

	@Get()
	@ApiOperation({ summary: '파티 멤버 목록 조회' })
	@ApiOkResponse({ description: '파티 멤버 목록을 반환합니다.' })
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: { example: { statusCode: 401, message: 'Unauthorized' } },
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 404,
				errorCode: 'p-001',
				message: '파티를 찾을 수 없습니다.',
			},
		},
	})
	getPartyMembers(
		@Param('partyId', ParseIntPipe) partyId: number,
	): Promise<MemberListResponseDto> {
		return this.partyMembersService.getPartyMembers(partyId);
	}

	@Delete('/:userId')
	@ApiOperation({ summary: '파티원 강퇴 (파티장만)' })
	@ApiOkResponse({
		description: '파티원을 강퇴했습니다.',
		schema: { example: { message: 'user2님을 강퇴했습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '자기 자신을 강퇴할 수 없습니다.',
		schema: {
			example: {
				statusCode: 400,
				message: '자기 자신을 강퇴할 수 없습니다.',
				error: 'Bad Request',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: { example: { statusCode: 401, message: 'Unauthorized' } },
	})
	@ApiForbiddenResponse({
		description: '파티장만 강퇴할 수 있습니다.',
		schema: {
			example: {
				statusCode: 403,
				message: '파티장만 강퇴할 수 있습니다.',
				error: 'Forbidden',
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티나 멤버를 찾을 수 없습니다.',
		schema: {
			example: {
				statusCode: 404,
				message: '해당 멤버를 찾을 수 없습니다.',
				error: 'Not Found',
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
	@ApiOperation({ summary: '파티장 권한 이양 (파티장만)' })
	@ApiOkResponse({
		description: '파티장을 변경했습니다.',
		schema: { example: { message: 'user2님이 파티장으로 변경되었습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '자기 자신에게 권한을 이양할 수 없습니다.',
		schema: {
			example: {
				statusCode: 400,
				message: '자기 자신에게 권한을 이양할 수 없습니다.',
				error: 'Bad Request',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: { example: { statusCode: 401, message: 'Unauthorized' } },
	})
	@ApiForbiddenResponse({
		description: '파티장만 권한을 이양할 수 있습니다.',
		schema: {
			example: {
				statusCode: 403,
				message: '파티장만 권한을 이양할 수 있습니다.',
				error: 'Forbidden',
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티나 멤버를 찾을 수 없습니다.',
		schema: {
			example: {
				statusCode: 404,
				message: '해당 멤버를 찾을 수 없습니다.',
				error: 'Not Found',
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
