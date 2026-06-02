import { Controller, Get, Param, Query, UseGuards, Request, Optional } from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Platform } from '@prisma/client';

@Controller('influencers')
export class InfluencersController {
  constructor(private influencersService: InfluencersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('platform') platform?: Platform,
  ) {
    return this.influencersService.findAllWithFollowStatus(req.user.id, search, platform);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.influencersService.findOne(id);
  }
}
