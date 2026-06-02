import { PrismaClient, Platform } from '@prisma/client';

const prisma = new PrismaClient();

class SimpleCrawler {
  constructor(private prisma: PrismaClient) {}

  async crawlInfluencer(influencerId: string): Promise<number> {
    const influencer = await this.prisma.influencer.findUnique({ where: { id: influencerId } });
    if (!influencer) return 0;
    const products = this.generateMockProducts(influencer.platform, influencer.handle, influencerId);
    let created = 0;
    for (const product of products) {
      await this.prisma.product.create({ data: product });
      created++;
    }
    return created;
  }

  private generateMockProducts(platform: Platform, handle: string, influencerId: string) {
    const catalog: Record<string, { title: string; category: string; price: number; tags: string[] }[]> = {
      INSTAGRAM: [
        { title: 'Linen Summer Dress', category: 'Fashion', price: 89.99, tags: ['dress', 'summer'] },
        { title: 'Minimalist Gold Necklace', category: 'Jewelry', price: 45.00, tags: ['jewelry', 'gold'] },
        { title: 'SPF 50 Tinted Moisturizer', category: 'Beauty', price: 34.00, tags: ['skincare', 'spf'] },
        { title: 'Crossbody Leather Bag', category: 'Accessories', price: 129.00, tags: ['bag', 'leather'] },
        { title: 'Yoga Mat Premium', category: 'Fitness', price: 68.00, tags: ['yoga', 'fitness'] },
      ],
      TIKTOK: [
        { title: 'Stanley Quencher 40oz', category: 'Lifestyle', price: 45.00, tags: ['viral', 'hydration'] },
        { title: 'Cloud Slippers', category: 'Fashion', price: 28.00, tags: ['viral', 'comfort'] },
        { title: 'Peptide Eye Cream', category: 'Beauty', price: 38.00, tags: ['skincare', 'anti-aging'] },
        { title: 'Acai Protein Powder', category: 'Health', price: 55.00, tags: ['health', 'protein'] },
        { title: 'LED Ring Light 12"', category: 'Tech', price: 35.00, tags: ['content', 'lighting'] },
      ],
      YOUTUBE: [
        { title: 'Blue Yeti USB Microphone', category: 'Tech', price: 129.00, tags: ['podcast', 'recording'] },
        { title: 'Sony WH-1000XM5 Headphones', category: 'Tech', price: 349.00, tags: ['audio', 'noise-cancelling'] },
        { title: 'Elgato Stream Deck', category: 'Tech', price: 149.99, tags: ['streaming', 'content'] },
        { title: 'Canon EOS R50 Camera', category: 'Tech', price: 679.00, tags: ['camera', 'vlogging'] },
      ],
      PINTEREST: [
        { title: 'Rattan Pendant Lamp', category: 'Home Decor', price: 78.00, tags: ['decor', 'boho'] },
        { title: 'Abstract Print Set (3)', category: 'Art', price: 42.00, tags: ['art', 'prints'] },
        { title: 'Macramé Wall Hanging', category: 'Home Decor', price: 55.00, tags: ['macrame', 'boho'] },
        { title: 'Terracotta Planter Set', category: 'Garden', price: 38.00, tags: ['plants', 'garden'] },
      ],
    };
    const list = catalog[platform] || catalog['INSTAGRAM'];
    const retailers = ['amazon.com', 'revolve.com', 'nordstrom.com', 'sephora.com', 'ltk.app'];
    return list.map((p, i) => ({
      title: p.title,
      description: `@${handle} recommends this! Click to shop.`,
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

const influencers = [
  {
    name: 'Emma Chen',
    handle: 'emmachenstyle',
    platform: Platform.INSTAGRAM,
    avatar: 'https://i.pravatar.cc/150?img=47',
    bio: 'Fashion & lifestyle | NYC based | Sharing my favourite finds daily ✨',
    followerCount: 890000,
    socialUrl: 'https://instagram.com/emmachenstyle',
  },
  {
    name: 'Jake Rivera',
    handle: 'jakerivera',
    platform: Platform.TIKTOK,
    avatar: 'https://i.pravatar.cc/150?img=68',
    bio: 'Tech reviews & life hacks 🔧 | 2M followers | Honest opinions only',
    followerCount: 2100000,
    socialUrl: 'https://tiktok.com/@jakerivera',
  },
  {
    name: 'Sofia Andersson',
    handle: 'sofialifestyle',
    platform: Platform.INSTAGRAM,
    avatar: 'https://i.pravatar.cc/150?img=31',
    bio: 'Scandinavian minimalism 🌿 | Home & wellness | Stockholm',
    followerCount: 560000,
    socialUrl: 'https://instagram.com/sofialifestyle',
  },
  {
    name: 'Marcus Thompson',
    handle: 'marcustech',
    platform: Platform.YOUTUBE,
    avatar: 'https://i.pravatar.cc/150?img=65',
    bio: 'Deep-dive tech reviews | Creator tools | 500K subs | New video every Tuesday',
    followerCount: 512000,
    socialUrl: 'https://youtube.com/@marcustech',
  },
  {
    name: 'Aisha Okonkwo',
    handle: 'aishabeauty',
    platform: Platform.TIKTOK,
    avatar: 'https://i.pravatar.cc/150?img=44',
    bio: 'Beauty educator 💄 | Skincare obsessed | Honest reviews | 3.2M TikTok',
    followerCount: 3200000,
    socialUrl: 'https://tiktok.com/@aishabeauty',
  },
  {
    name: 'Lena Hofer',
    handle: 'lenahome',
    platform: Platform.PINTEREST,
    avatar: 'https://i.pravatar.cc/150?img=23',
    bio: 'Interior design & DIY 🏡 | Pinning the best home inspo | Zürich',
    followerCount: 310000,
    socialUrl: 'https://pinterest.com/lenahome',
  },
  {
    name: 'Carlos Mendez',
    handle: 'carlosfits',
    platform: Platform.INSTAGRAM,
    avatar: 'https://i.pravatar.cc/150?img=55',
    bio: 'Fitness & nutrition 💪 | NASM certified | Miami | Daily workout inspo',
    followerCount: 740000,
    socialUrl: 'https://instagram.com/carlosfits',
  },
  {
    name: 'Yuki Tanaka',
    handle: 'yukitravel',
    platform: Platform.YOUTUBE,
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Solo travel diaries 🌏 | Budget & luxury | Japan → everywhere | 280K subs',
    followerCount: 280000,
    socialUrl: 'https://youtube.com/@yukitravel',
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.product.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.influencer.deleteMany();
  await prisma.user.deleteMany();

  const bcrypt = await import('bcrypt');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@shopfluence.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo User',
    },
  });
  console.log('Created demo user: demo@shopfluence.com / demo123');

  const crawlerService = new SimpleCrawler(prisma);

  for (const inf of influencers) {
    const created = await prisma.influencer.create({ data: inf });
    console.log(`Created influencer: @${created.handle} (${created.platform})`);
    const count = await crawlerService.crawlInfluencer(created.id);
    console.log(`  → ${count} products crawled`);
  }

  console.log('\nSeed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
