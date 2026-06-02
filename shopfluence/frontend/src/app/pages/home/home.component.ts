import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { Influencer, Platform } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatChipsModule,
    MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div style="margin-bottom: 32px;">
        <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">Discover Creators</h1>
        <p style="color: #666; font-size: 16px;">Follow your favourite influencers and shop their picks</p>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 24px;">
        <mat-form-field appearance="outline" style="flex: 1; min-width: 200px;">
          <mat-label>Search creators</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="search" placeholder="Name or handle">
        </mat-form-field>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button mat-stroked-button [color]="!activePlatform ? 'primary' : ''" (click)="setPlatform(null)" style="border-radius: 20px;">All</button>
          @for (p of platforms; track p) {
            <button mat-stroked-button [color]="activePlatform === p ? 'primary' : ''" (click)="setPlatform(p)" style="border-radius: 20px;">
              {{ p }}
            </button>
          }
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 60px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          @for (inf of influencers; track inf.id) {
            <mat-card style="overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
                      (mouseenter)="inf['hovered']=true" (mouseleave)="inf['hovered']=false"
                      [style.transform]="inf['hovered'] ? 'translateY(-4px)' : 'none'">
              <div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 80px; position: relative;">
                <img [src]="inf.avatar || 'https://i.pravatar.cc/80?img=1'"
                     [alt]="inf.name"
                     style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid white; position: absolute; bottom: -36px; left: 20px;">
              </div>
              <mat-card-content style="padding: 44px 20px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <div style="font-weight: 700; font-size: 17px;">{{ inf.name }}</div>
                    <div style="color: #888; font-size: 13px;">&#64;{{ inf.handle }}</div>
                  </div>
                  <span class="platform-chip {{ inf.platform }}">{{ inf.platform }}</span>
                </div>
                @if (inf.bio) {
                  <p style="font-size: 13px; color: #555; margin: 10px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ inf.bio }}
                  </p>
                }
                <div style="display: flex; gap: 16px; margin-top: 10px; font-size: 13px; color: #666;">
                  <span><strong>{{ formatFollowers(inf.followerCount) }}</strong> followers</span>
                  @if (inf._count) {
                    <span><strong>{{ inf._count.products }}</strong> products</span>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions style="padding: 8px 16px 16px; display: flex; gap: 8px;">
                <a [routerLink]="['/influencer', inf.id]" mat-stroked-button style="flex: 1; justify-content: center;">
                  <mat-icon>storefront</mat-icon> View Shop
                </a>
                <button mat-raised-button [color]="inf.isFollowed ? 'warn' : 'primary'"
                        (click)="toggleFollow(inf, $event)"
                        style="flex: 1; justify-content: center;">
                  <mat-icon>{{ inf.isFollowed ? 'person_remove' : 'person_add' }}</mat-icon>
                  {{ inf.isFollowed ? 'Unfollow' : 'Follow' }}
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>

        @if (influencers.length === 0) {
          <div style="text-align: center; padding: 60px; color: #999;">
            <mat-icon style="font-size: 64px; height: 64px; width: 64px; opacity: 0.3;">search_off</mat-icon>
            <p style="margin-top: 16px; font-size: 18px;">No creators found</p>
          </div>
        }
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  influencers: Influencer[] = [];
  loading = true;
  activePlatform: Platform | null = null;
  search = new FormControl('');
  platforms: Platform[] = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST'];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadInfluencers();
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.loadInfluencers());
  }

  loadInfluencers() {
    this.loading = true;
    this.api.getInfluencers(this.search.value || undefined, this.activePlatform || undefined).subscribe({
      next: (data) => { this.influencers = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  setPlatform(p: Platform | null) {
    this.activePlatform = p;
    this.loadInfluencers();
  }

  toggleFollow(inf: Influencer, e: Event) {
    e.stopPropagation();
    const action = inf.isFollowed ? this.api.unfollow(inf.id) : this.api.follow(inf.id);
    action.subscribe({
      next: () => {
        inf.isFollowed = !inf.isFollowed;
        this.snack.open(inf.isFollowed ? `Following @${inf.handle}` : `Unfollowed @${inf.handle}`, '', { duration: 2000 });
      },
    });
  }

  formatFollowers(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }
}
