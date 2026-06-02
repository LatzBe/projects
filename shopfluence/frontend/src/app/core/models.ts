export type Platform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'PINTEREST';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  avatar?: string;
  bio?: string;
  followerCount: number;
  socialUrl: string;
  isFollowed?: boolean;
  products?: Product[];
  _count?: { follows: number; products: number };
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  buyUrl: string;
  category?: string;
  tags: string[];
  influencer: Influencer;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
