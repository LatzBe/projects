import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ApiService } from '../../core/api.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, ProductCardComponent],
  template: `
    <div class="page-container">
      <div style="margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">My Feed</h1>
          <p style="color: #666; font-size: 16px;">Products from creators you follow</p>
        </div>
        <a routerLink="/home" mat-stroked-button color="primary">
          <mat-icon>add</mat-icon> Follow more creators
        </a>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 60px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (products.length === 0) {
        <div style="text-align: center; padding: 80px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
          <mat-icon style="font-size: 80px; height: 80px; width: 80px; color: #ddd;">dynamic_feed</mat-icon>
          <h2 style="margin: 20px 0 8px; font-size: 22px;">Your feed is empty</h2>
          <p style="color: #888; margin-bottom: 24px;">Follow some creators to see their product picks here</p>
          <a routerLink="/home" mat-raised-button color="primary">
            <mat-icon>explore</mat-icon> Discover Creators
          </a>
        </div>
      } @else {
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
          @for (product of products; track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
})
export class FeedComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getFeed().subscribe({
      next: (data) => { this.products = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
