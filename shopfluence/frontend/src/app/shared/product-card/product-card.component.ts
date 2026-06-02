import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, RouterLink],
  template: `
    <mat-card style="height: 100%; display: flex; flex-direction: column; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;"
              (mouseenter)="hovered=true" (mouseleave)="hovered=false"
              [style.transform]="hovered ? 'translateY(-4px)' : 'none'"
              [style.box-shadow]="hovered ? '0 8px 24px rgba(0,0,0,0.15) !important' : ''">
      <div style="position: relative; overflow: hidden;">
        <img [src]="product.imageUrl || 'https://picsum.photos/seed/' + product.id + '/400/300'"
             [alt]="product.title"
             style="width: 100%; height: 200px; object-fit: cover;"
             loading="lazy">
        @if (product.price) {
          <div style="position: absolute; top: 12px; right: 12px; background: white; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            {{ product.currency === 'USD' ? '$' : product.currency }}{{ product.price.toFixed(2) }}
          </div>
        }
        @if (product.category) {
          <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            {{ product.category }}
          </div>
        }
      </div>
      <mat-card-content style="flex: 1; padding: 16px;">
        <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px; line-height: 1.3;">{{ product.title }}</div>
        @if (product.description) {
          <div style="font-size: 13px; color: #666; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {{ product.description }}
          </div>
        }
        <a [routerLink]="['/influencer', product.influencer.id]" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <img [src]="product.influencer.avatar || 'https://i.pravatar.cc/32'" [alt]="product.influencer.name"
               style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
          <span style="font-size: 13px; color: #667eea; font-weight: 500;">&#64;{{ product.influencer.handle }}</span>
          <span class="platform-chip {{ product.influencer.platform }}">{{ product.influencer.platform }}</span>
        </a>
      </mat-card-content>
      <mat-card-actions style="padding: 8px 16px 16px;">
        <a [href]="product.buyUrl" target="_blank" mat-raised-button color="primary" style="width: 100%; justify-content: center;">
          <mat-icon>shopping_cart</mat-icon> Shop Now
        </a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;
  hovered = false;
}
