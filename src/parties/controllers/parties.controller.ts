import {
	Controller,
	Post,
	Body,
	UseGuards,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Delete,
	UsePipes,
	ValidationPipe,
	Query,
} from '@nestjs/common';
import { PartiesService } from '../services/parties.service';
import { CreatePartyDto } from '../dto/create-party.dto';
import { UpdatePartyDto } from '../dto/update-party.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PartyListItemDto } from '../dto/response.dto';
import {
	ApiTags,
	ApiOperation,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiBearerAuth,
	ApiQuery,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PartyWithMembersDto } from '../dto/party-with-members.dto';
import { GetUser } from '../../auth/decorator/get-user.decorator';

@ApiTags('parties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parties')
export class PartiesController {
	constructor(private readonly partiesService: PartiesService) {}

	@Post()
	@ApiOperation({ summary: '파티 생성' })
	@ApiCreatedResponse({
		description: '파티가 성공적으로 생성되었습니다.',
		type: PartyWithMembersDto,
	})
	@ApiBadRequestResponse({
		description: '잘못된 요청 데이터입니다.',
		schema: {
			example: {
				success: false,
				statusCode: 400,
				errorCode: 'g-001',
				message: '입력 데이터가 유효하지 않습니다.',
				detail: '비공개 파티는 참여 코드가 필요합니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: {
			example: {
				success: false,
				statusCode: 401,
				message: 'Unauthorized',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties',
			},
		},
	})
	@ApiNotFoundResponse({
		description: '존재하지 않는 게임입니다.',
		schema: {
			example: {
				success: false,
				statusCode: 404,
				errorCode: 'gm-001',
				message: '게임을 찾을 수 없습니다.',
				detail: '존재하지 않는 게임입니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties',
			},
		},
	})
	@UsePipes(new ValidationPipe({ transform: true }))
	createParty(
		@Body() createPartyDto: CreatePartyDto,
		@GetUser() user: { id: number },
	): Promise<PartyWithMembersDto> {
		return this.partiesService.createParty(createPartyDto, user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: '특정 파티 조회' })
	@ApiOkResponse({ description: '파티 + 멤버 정보를 반환합니다.', type: PartyWithMembersDto })
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: {
			example: {
				success: false,
				statusCode: 401,
				message: 'Unauthorized',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1',
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 404,
				errorCode: 'p-001',
				message: '파티를 찾을 수 없습니다.',
				detail: '존재하지 않는 파티입니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1',
			},
		},
	})
	async findPartyById(@Param('id', ParseIntPipe) id: number): Promise<PartyWithMembersDto> {
		return this.partiesService.findPartyById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: '파티 정보 수정' })
	@ApiOkResponse({
		description: '수정된 파티 정보를 반환합니다.',
		type: PartyWithMembersDto,
	})
	@UsePipes(new ValidationPipe({ transform: true }))
	updateParty(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePartyDto: UpdatePartyDto,
		@GetUser() user: { id: number },
	): Promise<PartyWithMembersDto> {
		return this.partiesService.updateParty(id, updatePartyDto, user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: '파티 삭제' })
	@ApiOkResponse({
		description: '파티가 성공적으로 삭제되었습니다.',
		schema: { example: { message: '파티가 성공적으로 삭제되었습니다.' } },
	})
	async deleteParty(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		await this.partiesService.deleteParty(id, user.id);
		return { message: '파티가 성공적으로 삭제되었습니다.' };
	}

	@Get()
	@ApiOperation({ summary: '파티 목록 조회' })
	@ApiOkResponse({
		description: '파티 목록을 반환합니다.',
		type: PartyListItemDto,
		isArray: true,
		schema: {
			example: [
				{
					id: 1,
					title: '같이 즐겁게 게임해요',
					gameId: 1,
					gameBannerUrl:
						'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
					creatorId: 1,
					purposeTag: '레이드',
					maxParticipants: 8,
					description: '파티 설명',
					isPrivate: false,
					accessCode: null,
					isCompleted: false,
					createdAt: '2025-06-10T18:00:00',
					updatedAt: '2025-06-10T18:00:00',
					leader: {
						userId: 1,
						username: 'user1',
						gameUsername: 'pro_gamer123',
					},
					currentMemberCount: 3,
				},
			],
		},
	})
	@ApiQuery({ name: 'gameId', required: false, type: Number, description: '게임 ID' })
	@ApiQuery({ name: 'isCompleted', required: false, type: Boolean, description: '완료 여부' })
	@ApiQuery({ name: 'isPrivate', required: false, type: Boolean, description: '비공개 여부' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 당 개수' })
	@UsePipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)
	async listParties(
		@Query('gameId') gameId?: number,
		@Query('isCompleted') isCompleted?: boolean,
		@Query('isPrivate') isPrivate?: boolean,
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	): Promise<import('../dto/response.dto').PartyListItemDto[]> {
		return this.partiesService.listParties({
			gameId,
			isCompleted,
			isPrivate,
			page,
			limit,
		});
	}

	@Patch(':id/complete')
	@ApiOperation({ summary: '파티 완료 처리' })
	@ApiOkResponse({
		description: '파티가 완료 처리되었습니다.',
		schema: { example: { message: '파티가 완료 처리되었습니다.' } },
	})
	@ApiBadRequestResponse({
		description: '이미 완료된 파티입니다.',
		schema: {
			example: {
				success: false,
				statusCode: 400,
				errorCode: 'p-009',
				message: '이미 완료된 파티입니다.',
				detail: '완료된 파티는 더 이상 수정할 수 없습니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/complete',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: '인증이 필요합니다.',
		schema: {
			example: {
				success: false,
				statusCode: 401,
				message: 'Unauthorized',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/complete',
			},
		},
	})
	@ApiForbiddenResponse({
		description: '파티 생성자만 완료 처리할 수 있습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 403,
				errorCode: 'p-010',
				message: '파티 생성자만 수행할 수 있는 작업입니다.',
				detail: '파티 생성자 권한이 필요합니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/complete',
			},
		},
	})
	@ApiNotFoundResponse({
		description: '파티를 찾을 수 없습니다.',
		schema: {
			example: {
				success: false,
				statusCode: 404,
				errorCode: 'p-001',
				message: '파티를 찾을 수 없습니다.',
				detail: '존재하지 않는 파티입니다.',
				timestamp: '2025-06-30T12:00:00.000Z',
				path: '/parties/1/complete',
			},
		},
	})
	async completeParty(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: { id: number },
	): Promise<{ message: string }> {
		await this.partiesService.completeParty(id, user.id);
		return { message: '파티가 완료 처리되었습니다.' };
	}
}
