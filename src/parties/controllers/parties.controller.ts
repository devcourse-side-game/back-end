import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { 
  CreatePartyDto, 
  UpdatePartyDto, 
  JoinPrivatePartyDto 
} from '../dto/index';
import { 
  PartyListResponseDto, 
  PartyDetailResponseDto, 
  PartyResponseDto, 
  MemberListResponseDto,
  PartiesErrorResponseDto 
} from '../dto/index';

@ApiTags('parties')
@Controller('api/parties')
export class PartiesController {
  
  // 파티 목록 조회
  @Get()
  @ApiOperation({ summary: '파티 목록 조회', description: '모든 파티 목록을 조회합니다 (필터링 옵션 포함)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'is_completed', required: false, description: '완료 여부 (true, false)' })
  @ApiQuery({ name: 'game_id', required: false, description: '게임 ID' })
  @ApiQuery({ name: 'purpose_tag', required: false, description: '목적 태그' })
  @ApiResponse({ status: 200, description: '파티 목록 조회 성공', type: PartyListResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: PartiesErrorResponseDto })
  getParties(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('is_completed') isCompleted?: boolean,
    @Query('game_id') gameId?: number,
    @Query('purpose_tag') purposeTag?: string,
  ) {
    return { parties: [] }; // 임시 응답
  }

  // 파티 생성
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 생성', description: '새 파티 모집글을 작성합니다' })
  @ApiResponse({ status: 201, description: '파티 생성 성공', type: PartyResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  createParty(@Body() createPartyDto: CreatePartyDto) {
    return { message: '파티가 성공적으로 생성되었습니다.' }; // 임시 응답
  }

  // 파티 상세 조회
  @Get(':partyId')
  @ApiOperation({ summary: '파티 상세 조회', description: '특정 파티의 상세 정보를 조회합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 상세 조회 성공', type: PartyDetailResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  getPartyById(@Param('partyId') partyId: number) {
    return { id: partyId }; // 임시 응답
  }

  // 파티 정보 수정
  @Put(':partyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 정보 수정', description: '파티 정보를 업데이트합니다 (파티장만 가능)' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 정보 수정 성공', type: PartyResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  updateParty(
    @Param('partyId') partyId: number,
    @Body() updatePartyDto: UpdatePartyDto
  ) {
    return { message: '파티 정보가 성공적으로 수정되었습니다.' }; // 임시 응답
  }

  // 파티 삭제
  @Delete(':partyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 삭제', description: '파티를 삭제합니다 (파티장만 가능)' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 삭제 성공', type: PartyResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  deleteParty(@Param('partyId') partyId: number) {
    return { message: '파티가 성공적으로 삭제되었습니다.' }; // 임시 응답
  }

  // 파티 완료 처리
  @Put(':partyId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 완료 처리', description: '파티 모집을 완료 처리합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 완료 처리 성공', type: PartyResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  completeParty(@Param('partyId') partyId: number) {
    return { message: '파티 모집이 완료되었습니다.' }; // 임시 응답
  }

  // 파티 참가
  @Post(':partyId/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 참가', description: '파티에 참가 신청합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 참가 성공', type: PartyResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  joinParty(@Param('partyId') partyId: number) {
    return { message: '파티에 성공적으로 참가했습니다.' }; // 임시 응답
  }

  // 비공개 파티 참가
  @Post(':partyId/join-private')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '비공개 파티 참가', description: '접근 코드로 비공개 파티에 참가합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '비공개 파티 참가 성공', type: PartyResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 또는 유효하지 않은 코드', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  joinPrivateParty(
    @Param('partyId') partyId: number,
    @Body() joinPrivatePartyDto: JoinPrivatePartyDto
  ) {
    return { message: '비공개 파티에 성공적으로 참가했습니다.' }; // 임시 응답
  }

  // 파티 탈퇴
  @Delete(':partyId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티 탈퇴', description: '파티에서 탈퇴합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티 탈퇴 성공', type: PartyResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  leaveParty(@Param('partyId') partyId: number) {
    return { message: '파티에서 성공적으로 탈퇴했습니다.' }; // 임시 응답
  }

  // 파티원 목록 조회
  @Get(':partyId/members')
  @ApiOperation({ summary: '파티원 목록 조회', description: '파티 참여자 목록을 조회합니다' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiResponse({ status: 200, description: '파티원 목록 조회 성공', type: MemberListResponseDto })
  @ApiResponse({ status: 404, description: '파티를 찾을 수 없음', type: PartiesErrorResponseDto })
  getPartyMembers(@Param('partyId') partyId: number) {
    return { members: [] }; // 임시 응답
  }

  // 파티원 강퇴
  @Delete(':partyId/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티원 강퇴', description: '파티원을 강퇴합니다 (파티장만 가능)' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiParam({ name: 'userId', description: '강퇴할 사용자 ID' })
  @ApiResponse({ status: 200, description: '파티원 강퇴 성공', type: PartyResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티 또는 사용자를 찾을 수 없음', type: PartiesErrorResponseDto })
  kickMember(
    @Param('partyId') partyId: number,
    @Param('userId') userId: number
  ) {
    return { message: '파티원이 성공적으로 강퇴되었습니다.' }; // 임시 응답
  }

  // 파티장 위임 (추후 시간 나면)
  @Put(':partyId/leader/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '파티장 변경', description: '파티장 권한을 다른 파티원에게 이양합니다 (현재 파티장만 가능)' })
  @ApiParam({ name: 'partyId', description: '파티 ID' })
  @ApiParam({ name: 'userId', description: '새 파티장이 될 사용자 ID' })
  @ApiResponse({ status: 200, description: '파티장 변경 성공', type: PartyResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: PartiesErrorResponseDto })
  @ApiResponse({ status: 404, description: '파티 또는 사용자를 찾을 수 없음', type: PartiesErrorResponseDto })
  changeLeader(
    @Param('partyId') partyId: number,
    @Param('userId') userId: number
  ) {
    return { message: '파티장 권한이 성공적으로 위임되었습니다.' }; // 임시 응답
  }
}
