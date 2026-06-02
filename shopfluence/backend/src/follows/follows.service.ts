import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  getFollowed(userId: string) {
    return this.prisma.follow.findMany({
      where: { userId },
      include: {
        influencer: {
          include: { _count: { select: { products: true, follows: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  follow(userId: string, influencerId: string) {
    return this.prisma.follow.upsert({
      where: { userId_influencerId: { userId, influencerId } },
      create: { userId, influencerId },
      update: {},
    });
  }

  unfollow(userId: string, influencerId: string) {
    return this.prisma.follow.deleteMany({ where: { userId, influencerId } });
  }
}
