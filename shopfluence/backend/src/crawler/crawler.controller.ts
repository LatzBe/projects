import { Controller, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { InstagramCrawlerService } from './instagram.crawler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('crawler')
@UseGuards(JwtAuthGuard)
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly instagramCrawler: InstagramCrawlerService,
  ) {}

  /** Trigger mock crawl (always works, no credentials needed) */
  @Post('mock/:influencerId')
  @HttpCode(200)
  async crawlMock(@Param('influencerId') influencerId: string) {
    const count = await this.crawlerService.crawlInfluencer(influencerId);
    return { message: `Mock crawl complete`, productsCreated: count };
  }

  /** Trigger real Instagram crawl (requires INSTAGRAM_ACCESS_TOKEN in .env) */
  @Post('instagram/:influencerId')
  @HttpCode(200)
  async crawlInstagram(@Param('influencerId') influencerId: string) {
    const result = await this.instagramCrawler.crawl(influencerId);
    return { message: 'Instagram crawl complete', ...result };
  }
}
