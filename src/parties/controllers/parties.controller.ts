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
import {
	ApiTags,
	ApiOperation,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { Party } from '../entities/party.entity';
import { GetUser } from '../../auth/decorator/get-user.decorator';

@ApiTags('parties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parties')
export class PartiesController {
	constructor(private readonly partiesService: PartiesService) {}

	@Post()
	@ApiOperation({ summary: '파티 생성' })
	@ApiCreatedResponse({ description: '파티가 성공적으로 생성되었습니다.', type: Party })
	@UsePipes(new ValidationPipe({ transform: true }))
	createParty(
		@Body() createPartyDto: CreatePartyDto,
		@GetUser() user: { id: number },
	): Promise<Party> {
		return this.partiesService.createParty(createPartyDto, user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: '특정 파티 조회' })
	@ApiOkResponse({ description: '파티 정보를 반환합니다.', type: Party })
	findPartyById(@Param('id', ParseIntPipe) id: number): Promise<Party> {
		return this.partiesService.findPartyById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: '파티 정보 수정' })
	@ApiOkResponse({ description: '수정된 파티 정보를 반환합니다.', type: Party })
	@UsePipes(new ValidationPipe({ transform: true }))
	updateParty(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePartyDto: UpdatePartyDto,
		@GetUser() user: { id: number },
	): Promise<Party> {
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
	@ApiOkResponse({ description: '파티 목록을 반환합니다.', type: [Party] })
	@ApiQuery({ name: 'gameId', required: false, type: Number, description: '게임 ID' })
	@ApiQuery({ name: 'isCompleted', required: false, type: Boolean, description: '완료 여부' })
	@ApiQuery({ name: 'isPrivate', required: false, type: Boolean, description: '비공개 여부' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 당 개수' })
	async listParties(
		@Query('gameId') gameId?: number,
		@Query('isCompleted') isCompleted?: boolean,
		@Query('isPrivate') isPrivate?: boolean,
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	): Promise<Party[]> {
		return this.partiesService.listParties({
			gameId,
			isCompleted,
			isPrivate,
			page,
			limit,
		});
	}
}
