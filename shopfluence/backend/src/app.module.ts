import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InfluencersModule } from './influencers/influencers.module';
import { ProductsModule } from './products/products.module';
import { FollowsModule } from './follows/follows.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    InfluencersModule,
    ProductsModule,
    FollowsModule,
    CrawlerModule,
  ],
})
export class AppModule {}
