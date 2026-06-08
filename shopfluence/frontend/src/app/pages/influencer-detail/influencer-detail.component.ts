import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ApiService } from '../../core/api.service';
import { Influencer } from '../../core/models';

@Component({
  selector: 'app-influencer-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, ProductCardComponent],
  template: `
    @if (loading) {
      <div style="display: flex; justify-content: center; padding: 100px;">
        <mat-spinner></mat-spinner>
      </div>
    } @else if (influencer) {
      <div>
        <div style="background: linear-gradient(135deg, #5b21b6 0%, #9333ea 100%); padding: 40px 0; margin-bottom: 0;">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; display: flex; align-items: flex-end; gap: 24px; flex-wrap: wrap;">
            <img [src]="influencer.avatar || 'https://i.pravatar.cc/120'"
                 [alt]="influencer.name"
                 style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
            <div style="flex: 1; color: white; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px;">
                <h1 style="font-size: 28px; font-weight: 700; margin: 0;">{{ influencer.name }}</h1>
                <span class="platform-chip {{ influencer.platform }}">{{ influencer.platform }}</span>
              </div>
              <div style="opacity: 0.9; font-size: 15px; margin-bottom: 8px;">&#64;{{ influencer.handle }}</div>
              @if (influencer.bio) {
                <p style="opacity: 0.85; font-size: 14px; margin: 0 0 12px; max-width: 600px;">{{ influencer.bio }}</p>
              }
              <div style="display: flex; gap: 20px; font-size: 14px; opacity: 0.9;">
                <span><strong>{{ formatFollowers(influencer.followerCount) }}</strong> followers</span>
                @if (influencer._count) {
                  <span><strong>{{ influencer._count.products }}</strong> products</span>
                }
              </div>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a [href]="influencer.socialUrl" target="_blank" mat-stroked-button style="color: white; border-color: rgba(255,255,255,0.6);">
                <mat-icon>open_in_new</mat-icon> View Profile
              </a>
              <button mat-raised-button [color]="isFollowed ? 'warn' : ''"
                      [style.background]="isFollowed ? '' : 'white'"
                      [style.color]="isFollowed ? '' : '#5b21b6'"
                      (click)="toggleFollow()">
                <mat-icon>{{ isFollowed ? 'person_remove' : 'person_add' }}</mat-icon>
                {{ isFollowed ? 'Unfollow' : 'Follow' }}
              </button>
            </div>
          </div>
        </div>

        <div class="page-container">
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">
            {{ influencer.products?.length || 0 }} Products
          </h2>
          @if (influencer.products && influencer.products.length > 0) {
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
              @for (product of enrichedProducts(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>
          } @else {
            <div style="text-align: center; padding: 60px; background: #1a1535; border-radius: 16px;">
              <mat-icon style="font-size: 64px; height: 64px; width: 64px; color: #ddd;">inventory_2</mat-icon>
              <p style="margin-top: 16px; color: #888;">No products yet</p>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class InfluencerDetailComponent implements OnInit {
  influencer: Influencer | null = null;
  loading = true;
  isFollowed = false;

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getInfluencer(id).subscribe({
      next: (inf) => {
        this.influencer = inf;
        this.loading = false;
        this.checkFollowStatus(id);
      },
      error: () => { this.loading = false; },
    });
  }

  checkFollowStatus(id: string) {
    this.api.getFollowed().subscribe({
      next: (follows) => {
        this.isFollowed = follows.some(f => f.influencerId === id);
      },
    });
  }

  toggleFollow() {
    if (!this.influencer) return;
    const action = this.isFollowed ? this.api.unfollow(this.influencer.id) : this.api.follow(this.influencer.id);
    action.subscribe({
      next: () => {
        this.isFollowed = !this.isFollowed;
        this.snack.open(this.isFollowed ? `Following @${this.influencer!.handle}` : `Unfollowed @${this.influencer!.handle}`, '', { duration: 2000 });
      },
    });
  }

  enrichedProducts() {
    if (!this.influencer?.products) return [];
    return this.influencer.products.map(p => ({ ...p, influencer: this.influencer! }));
  }

  formatFollowers(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }
}
