import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const AFFILIATE_PATTERNS = [
  /https?:\/\/(www\.)?amazon\.[a-z.]+\/[^\s]*/gi,
  /https?:\/\/amzn\.to\/[^\s]*/gi,
  /https?:\/\/(www\.)?ltk\.co\/[^\s]*/gi,
  /https?:\/\/(www\.)?liketoknow\.it\/[^\s]*/gi,
  /https?:\/\/(www\.)?shopmy\.us\/[^\s]*/gi,
  /https?:\/\/rstyle\.me\/[^\s]*/gi,
  /https?:\/\/(www\.)?shareasale\.com\/[^\s]*/gi,
  /https?:\/\/(www\.)?pepperjam\.com\/[^\s]*/gi,
];

@Injectable()
export class InstagramCrawlerService {
  private readonly logger = new Logger(InstagramCrawlerService.name);
  private readonly baseUrl = 'https://graph.instagram.com/v19.0';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async crawl(influencerId: string): Promise<{ created: number; skipped: number }> {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) {
      throw new Error('INSTAGRAM_ACCESS_TOKEN is not set in environment');
    }

    const influencer = await this.prisma.influencer.findUnique({ where: { id: influencerId } });
    if (!influencer) throw new Error(`Influencer ${influencerId} not found`);

    this.logger.log(`Crawling Instagram for @${influencer.handle}`);

    const media = await this.fetchMedia(token);
    let created = 0;
    let skipped = 0;

    for (const item of media) {
      const links = this.extractLinks(item.caption ?? '');
      if (links.length === 0) { skipped++; continue; }

      for (const link of links) {
        const title = this.titleFromCaption(item.caption ?? '', link);
        await this.prisma.product.upsert({
          where: { id: `ig-${item.id}-${Buffer.from(link).toString('base64').slice(0, 8)}` },
          create: {
            id: `ig-${item.id}-${Buffer.from(link).toString('base64').slice(0, 8)}`,
            title,
            description: item.caption?.slice(0, 300) ?? '',
            imageUrl: item.media_url,
            buyUrl: link,
            currency: 'USD',
            tags: ['instagram', 'affiliate'],
            influencerId,
          },
          update: { imageUrl: item.media_url },
        });
        created++;
      }
    }

    this.logger.log(`@${influencer.handle}: ${created} products saved, ${skipped} posts skipped (no links)`);
    return { created, skipped };
  }

  private async fetchMedia(token: string): Promise<InstagramMedia[]> {
    const fields = 'id,caption,media_url,permalink,timestamp,media_type';
    const url = `${this.baseUrl}/me/media?fields=${fields}&limit=50&access_token=${token}`;
    const { data } = await firstValueFrom(this.http.get<{ data: InstagramMedia[] }>(url));
    return data.data ?? [];
  }

  private extractLinks(text: string): string[] {
    const found = new Set<string>();
    for (const pattern of AFFILIATE_PATTERNS) {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const match of matches) {
        found.add(match[0].replace(/[.,)]+$/, ''));
      }
    }
    return [...found];
  }

  private titleFromCaption(caption: string, _link: string): string {
    const first = caption.split('\n')[0].replace(/#\w+/g, '').trim();
    return first.slice(0, 100) || 'Instagram Product';
  }
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
  media_type: string;
}
