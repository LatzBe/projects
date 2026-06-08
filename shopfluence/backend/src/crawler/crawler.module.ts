import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { InstagramCrawlerService } from './instagram.crawler.service';

@Module({
  imports: [HttpModule],
  controllers: [CrawlerController],
  providers: [CrawlerService, InstagramCrawlerService],
  exports: [CrawlerService, InstagramCrawlerService],
})
export class CrawlerModule {}
