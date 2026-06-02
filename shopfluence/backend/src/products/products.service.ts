import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findByInfluencer(influencerId: string) {
    return this.prisma.product.findMany({
      where: { influencerId },
      include: { influencer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findFeedForUser(userId: string) {
    return this.prisma.product.findMany({
      where: {
        influencer: { follows: { some: { userId } } },
      },
      include: { influencer: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  create(data: {
    title: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    buyUrl: string;
    category?: string;
    tags?: string[];
    influencerId: string;
  }) {
    return this.prisma.product.create({ data });
  }
}
