import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getFollowed(@Request() req) {
    return this.followsService.getFollowed(req.user.id);
  }

  @Post(':influencerId')
  @UseGuards(JwtAuthGuard)
  follow(@Request() req, @Param('influencerId') influencerId: string) {
    return this.followsService.follow(req.user.id, influencerId);
  }

  @Delete(':influencerId')
  @UseGuards(JwtAuthGuard)
  unfollow(@Request() req, @Param('influencerId') influencerId: string) {
    return this.followsService.unfollow(req.user.id, influencerId);
  }
}
