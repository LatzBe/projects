import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Platform, Influencer, Product } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = '/api';

  constructor(private http: HttpClient) {}

  getInfluencers(search?: string, platform?: Platform) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (platform) params = params.set('platform', platform);
    return this.http.get<Influencer[]>(`${this.API}/influencers`, { params });
  }

  getInfluencer(id: string) {
    return this.http.get<Influencer>(`${this.API}/influencers/${id}`);
  }

  getFeed() {
    return this.http.get<Product[]>(`${this.API}/products/feed`);
  }

  getFollowed() {
    return this.http.get<any[]>(`${this.API}/follows`);
  }

  follow(influencerId: string) {
    return this.http.post(`${this.API}/follows/${influencerId}`, {});
  }

  unfollow(influencerId: string) {
    return this.http.delete(`${this.API}/follows/${influencerId}`);
  }
}
