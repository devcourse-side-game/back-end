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
	@ApiOkResponse({ description: '파티에 참가했습니다.' })
	joinParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
	): Promise<void> {
		return this.partyMembersService.joinParty(partyId, user.id);
	}

	@Post('/join-private')
	@ApiOperation({ summary: '비공개 파티 참가' })
	@ApiOkResponse({ description: '비공개 파티에 참가했습니다.' })
	joinPrivateParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Body() dto: JoinPrivatePartyDto,
		@GetUser() user: { id: number },
	): Promise<void> {
		return this.partyMembersService.joinPrivateParty(partyId, user.id, dto.accessCode);
	}

	@Post('/leave')
	@ApiOperation({ summary: '파티 탈퇴' })
	@ApiOkResponse({ description: '파티에서 탈퇴했습니다.' })
	leaveParty(
		@Param('partyId', ParseIntPipe) partyId: number,
		@GetUser() user: { id: number },
	): Promise<void> {
		return this.partyMembersService.leaveParty(partyId, user.id);
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
	@ApiOkResponse({ description: '파티원을 강퇴했습니다.' })
	kickMember(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Param('userId', ParseIntPipe) userId: number,
		@GetUser() user: { id: number },
	): Promise<void> {
		return this.partyMembersService.kickMember(partyId, user.id, userId);
	}

	@Put('/leader/:userId')
	@ApiOperation({ summary: '파티장 권한 이양 (파티장만)' })
	@ApiOkResponse({ description: '파티장을 변경했습니다.' })
	changeLeader(
		@Param('partyId', ParseIntPipe) partyId: number,
		@Param('userId', ParseIntPipe) newLeaderId: number,
		@GetUser() user: { id: number },
	): Promise<void> {
		return this.partyMembersService.changeLeader(partyId, user.id, newLeaderId);
	}
}
