import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('influencerId') influencerId?: string) {
    if (influencerId) return this.productsService.findByInfluencer(influencerId);
    return [];
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  getFeed(@Request() req) {
    return this.productsService.findFeedForUser(req.user.id);
  }
}
