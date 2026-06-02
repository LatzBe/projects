import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';

/**
 * Mock crawler simulating social media scraping.
 *
 * Production integration points:
 * - Instagram: Instagram Graph API (requires Business/Creator account + approved app)
 * - TikTok: TikTok Research API or TikTok for Developers API
 * - YouTube: YouTube Data API v3 (description link parsing)
 * - Pinterest: Pinterest API v5
 *
 * For platforms without official product APIs, use Playwright/Puppeteer
 * with a job queue (BullMQ) to scrape public profile pages, then
 * extract links via regex/NLP (e.g., "link in bio", affiliate URLs,
 * Amazon/LTK/ShopMy links).
 */
@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(private prisma: PrismaService) {}

  async crawlInfluencer(influencerId: string): Promise<number> {
    const influencer = await this.prisma.influencer.findUnique({ where: { id: influencerId } });
    if (!influencer) return 0;

    this.logger.log(`Crawling ${influencer.platform}:@${influencer.handle}`);

    const products = this.generateMockProducts(influencer.platform, influencer.handle, influencerId);

    let created = 0;
    for (const product of products) {
      await this.prisma.product.create({ data: product });
      created++;
    }

    this.logger.log(`Created ${created} products for @${influencer.handle}`);
    return created;
  }

  async crawlAll(): Promise<void> {
    const influencers = await this.prisma.influencer.findMany();
    for (const inf of influencers) {
      await this.crawlInfluencer(inf.id);
    }
  }

  private generateMockProducts(platform: Platform, handle: string, influencerId: string) {
    const productCatalog = {
      INSTAGRAM: [
        { title: 'Linen Summer Dress', category: 'Fashion', price: 89.99, tags: ['dress', 'summer', 'fashion'] },
        { title: 'Minimalist Gold Necklace', category: 'Jewelry', price: 45.00, tags: ['jewelry', 'gold', 'minimalist'] },
        { title: 'SPF 50 Tinted Moisturizer', category: 'Beauty', price: 34.00, tags: ['skincare', 'spf', 'beauty'] },
        { title: 'Crossbody Leather Bag', category: 'Accessories', price: 129.00, tags: ['bag', 'leather', 'accessories'] },
        { title: 'Yoga Mat Premium', category: 'Fitness', price: 68.00, tags: ['yoga', 'fitness', 'wellness'] },
        { title: 'Ceramic Diffuser Set', category: 'Home', price: 52.00, tags: ['home', 'aromatherapy', 'wellness'] },
      ],
      TIKTOK: [
        { title: 'Stanley Quencher 40oz', category: 'Lifestyle', price: 45.00, tags: ['viral', 'hydration', 'tiktok'] },
        { title: 'Cloud Slippers', category: 'Fashion', price: 28.00, tags: ['viral', 'comfort', 'fashion'] },
        { title: 'Peptide Eye Cream', category: 'Beauty', price: 38.00, tags: ['skincare', 'anti-aging', 'tiktok'] },
        { title: 'Acai Protein Powder', category: 'Health', price: 55.00, tags: ['health', 'protein', 'fitness'] },
        { title: 'LED Ring Light 12"', category: 'Tech', price: 35.00, tags: ['content', 'lighting', 'tech'] },
      ],
      YOUTUBE: [
        { title: 'Blue Yeti USB Microphone', category: 'Tech', price: 129.00, tags: ['podcast', 'recording', 'tech'] },
        { title: 'Sony WH-1000XM5 Headphones', category: 'Tech', price: 349.00, tags: ['audio', 'noise-cancelling', 'tech'] },
        { title: 'Elgato Stream Deck', category: 'Tech', price: 149.99, tags: ['streaming', 'content', 'tech'] },
        { title: 'Notion Premium Plan', category: 'Productivity', price: 16.00, tags: ['productivity', 'notion', 'organization'] },
        { title: 'Canon EOS R50 Camera', category: 'Tech', price: 679.00, tags: ['camera', 'vlogging', 'tech'] },
      ],
      PINTEREST: [
        { title: 'Rattan Pendant Lamp', category: 'Home Decor', price: 78.00, tags: ['decor', 'boho', 'lighting'] },
        { title: 'Abstract Print Set (3)', category: 'Art', price: 42.00, tags: ['art', 'prints', 'decor'] },
        { title: 'Macramé Wall Hanging', category: 'Home Decor', price: 55.00, tags: ['macrame', 'boho', 'handmade'] },
        { title: 'Terracotta Planter Set', category: 'Garden', price: 38.00, tags: ['plants', 'terracotta', 'garden'] },
      ],
    };

    const catalog = productCatalog[platform] || productCatalog.INSTAGRAM;
    const retailers = ['amazon.com', 'revolve.com', 'nordstrom.com', 'shopbop.com', 'sephora.com', 'ltk.app'];
    const imageThemes = ['fashion', 'beauty', 'lifestyle', 'tech', 'home'];

    return catalog.slice(0, Math.floor(Math.random() * 3) + 3).map((p, i) => ({
      title: p.title,
      description: `@${handle} loves this! Swipe up or click the link to shop.`,
      imageUrl: `https://picsum.photos/seed/${handle}-${i}/400/400`,
      price: p.price,
      currency: 'USD',
      buyUrl: `https://${retailers[i % retailers.length]}/products/${p.title.toLowerCase().replace(/\s+/g, '-')}`,
      category: p.category,
      tags: p.tags,
      influencerId,
    }));
  }
}
