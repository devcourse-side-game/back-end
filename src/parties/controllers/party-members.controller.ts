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
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorator/get-user.decorator';
// import { PartyMember } from '../entities/party-members.entity';
import { PartyMembersService } from '../services/party-members.service';
import { JoinPrivatePartyDto } from '../dto/join-private-party.dto';
import { MemberListResponseDto } from '../dto/response.dto';

@ApiTags('PartyMembers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parties/:partyId/members')
export class PartyMembersController {
	constructor(private readonly partyMembersService: PartyMembersService) {}

	@Post('/join')
	@ApiOperation({ summary: '파티 참가' })
	@ApiOkResponse({
		description: '파티에 참가했습니다.',
		schema: { example: { message: 'user1님이 파티에 참가했습니다.' } },
	})
	async joinParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.joinParty(partyId, user.id);
		return { message: `${username}님이 파티에 참가했습니다.` };
	}

	@Post('/join-private')
	@ApiOperation({ summary: '비공개 파티 참가' })
	@ApiOkResponse({
		description: '비공개 파티에 참가했습니다.',
		schema: { example: { message: 'user1님이 비공개 파티에 참가했습니다.' } },
	})
	async joinPrivateParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Body() dto: JoinPrivatePartyDto,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		const { username } = await this.partyMembersService.joinPrivateParty(
			partyId,
			user.id,
			dto.accessCode,
		);
		return { message: `${username}님이 비공개 파티에 참가했습니다.` };
	}

	@Post('/leave')
	@ApiOperation({ summary: '파티 탈퇴' })
	@ApiOkResponse({
		description: '파티에서 탈퇴했습니다.',
		schema: { example: { message: 'user1님이 파티에서 탈퇴했습니다.' } },
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
