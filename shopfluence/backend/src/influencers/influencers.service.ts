import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class InfluencersService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, platform?: Platform) {
    return this.prisma.influencer.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { handle: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(platform && { platform }),
      },
      include: { _count: { select: { follows: true, products: true } } },
      orderBy: { followerCount: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.influencer.findUnique({
      where: { id },
      include: {
        products: { orderBy: { createdAt: 'desc' } },
        _count: { select: { follows: true, products: true } },
      },
    });
  }

  async findAllWithFollowStatus(userId: string, search?: string, platform?: Platform) {
    const influencers = await this.findAll(search, platform);
    const followedIds = new Set(
      (await this.prisma.follow.findMany({ where: { userId }, select: { influencerId: true } }))
        .map((f) => f.influencerId),
    );
    return influencers.map((inf) => ({ ...inf, isFollowed: followedIds.has(inf.id) }));
  }

  create(data: {
    name: string;
    handle: string;
    platform: Platform;
    avatar?: string;
    bio?: string;
    followerCount?: number;
    socialUrl: string;
  }) {
    return this.prisma.influencer.create({ data });
  }
}
