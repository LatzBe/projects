import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const AFFILIATE_PATTERNS = [
  /https?:\/\/(www\.)?amazon\.[a-z.]+\/[^\s<>"')]+/gi,
  /https?:\/\/amzn\.to\/[^\s<>"')]+/gi,
  /https?:\/\/(www\.)?ltk\.co\/[^\s<>"')]+/gi,
  /https?:\/\/(www\.)?liketoknow\.it\/[^\s<>"')]+/gi,
  /https?:\/\/(www\.)?shopmy\.us\/[^\s<>"')]+/gi,
  /https?:\/\/rstyle\.me\/[^\s<>"')]+/gi,
  /https?:\/\/(www\.)?shareasale\.com\/[^\s<>"')]+/gi,
];

export interface CrawlResult {
  created: number;
  skipped: number;
  error?: string;
}

@Injectable()
export class InstagramCrawlerService {
  private readonly logger = new Logger(InstagramCrawlerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crawl an Instagram profile using Playwright (headless browser).
   *
   * Requires:
   *   INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD in .env
   *   playwright and chromium installed: npx playwright install chromium
   *
   * Strategy:
   *   1. Log in to Instagram
   *   2. Navigate to the influencer's profile page
   *   3. Scrape the latest posts (up to 12 visible in grid)
   *   4. Open each post, grab caption + image
   *   5. Extract affiliate / product links from captions
   */
  async crawl(influencerId: string): Promise<CrawlResult> {
    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    if (!username || !password) {
      throw new Error('INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD must be set in .env');
    }

    const influencer = await this.prisma.influencer.findUnique({ where: { id: influencerId } });
    if (!influencer) throw new Error(`Influencer ${influencerId} not found`);
    if (influencer.platform !== 'INSTAGRAM') {
      throw new Error(`Influencer ${influencer.handle} is not an Instagram account`);
    }

    this.logger.log(`Starting Playwright crawl for @${influencer.handle}`);

    // Dynamic import so the module loads only when needed
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    let created = 0;
    let skipped = 0;

    try {
      // ── Login ──────────────────────────────────────────────────────────────
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[name="username"]', { timeout: 15000 });
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/instagram\.com\/?(?!accounts)/, { timeout: 15000 });
      this.logger.log('Login successful');

      // Dismiss "Save login info" / "Turn on notifications" dialogs if present
      for (const text of ['Not now', 'Not Now']) {
        const btn = page.getByRole('button', { name: text });
        if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) await btn.click();
      }

      // ── Scrape profile grid ───────────────────────────────────────────────
      await page.goto(`https://www.instagram.com/${influencer.handle}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('article a', { timeout: 15000 });

      const postLinks = await page.$$eval('article a[href*="/p/"]', (els) =>
        [...new Set(els.map((a) => (a as HTMLAnchorElement).href))].slice(0, 12),
      );

      this.logger.log(`Found ${postLinks.length} posts for @${influencer.handle}`);

      for (const postUrl of postLinks) {
        try {
          await page.goto(postUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('article', { timeout: 10000 });

          const caption = await page.$eval(
            'article [data-testid="post-comment-root"] span, article h1, article div[dir="auto"] span',
            (el) => el.textContent ?? '',
          ).catch(() => '');

          const imageUrl = await page.$eval(
            'article img[srcset], article img[src]',
            (img: HTMLImageElement) => img.src,
          ).catch(() => undefined);

          const links = this.extractLinks(caption);

          if (links.length === 0) { skipped++; continue; }

          const postId = postUrl.match(/\/p\/([^/]+)/)?.[1] ?? postUrl;

          for (const link of links) {
            const id = `ig-${postId}-${Buffer.from(link).toString('base64').slice(0, 8)}`;
            await this.prisma.product.upsert({
              where: { id },
              create: {
                id,
                title: this.titleFromCaption(caption),
                description: caption.slice(0, 300),
                imageUrl,
                buyUrl: link,
                currency: 'USD',
                tags: ['instagram', 'affiliate'],
                influencerId,
              },
              update: { imageUrl },
            });
            created++;
          }
        } catch (postErr) {
          this.logger.warn(`Skipping post ${postUrl}: ${postErr.message}`);
          skipped++;
        }
      }
    } finally {
      await browser.close();
    }

    this.logger.log(`@${influencer.handle}: ${created} products saved, ${skipped} posts skipped`);
    return { created, skipped };
  }

  private extractLinks(text: string): string[] {
    const found = new Set<string>();
    for (const pattern of AFFILIATE_PATTERNS) {
      for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
        found.add(match[0].replace(/[.,)]+$/, ''));
      }
    }
    return [...found];
  }

  private titleFromCaption(caption: string): string {
    const first = caption.split('\n')[0].replace(/#\w+/g, '').trim();
    return first.slice(0, 100) || 'Instagram Product';
  }
}
