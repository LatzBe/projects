import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
      <a routerLink="/home" style="font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: white; display: flex; align-items: center; gap: 8px;">
        <mat-icon>shopping_bag</mat-icon> Shopfluence
      </a>
      <span style="flex: 1"></span>
      <nav style="display: flex; gap: 4px; align-items: center;">
        <a mat-button routerLink="/home" routerLinkActive="active-link" style="color: white;">
          <mat-icon>explore</mat-icon> Discover
        </a>
        <a mat-button routerLink="/feed" routerLinkActive="active-link" style="color: white;">
          <mat-icon>dynamic_feed</mat-icon> My Feed
        </a>
        <button mat-icon-button [matMenuTriggerFor]="menu" style="color: white;">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <div style="padding: 12px 16px; border-bottom: 1px solid #eee;">
            <div style="font-weight: 600;">{{ auth.currentUser()?.name }}</div>
            <div style="font-size: 13px; color: #666;">{{ auth.currentUser()?.email }}</div>
          </div>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sign out
          </button>
        </mat-menu>
      </nav>
    </mat-toolbar>
  `,
  styles: [`.active-link { background: rgba(255,255,255,0.15) !important; border-radius: 8px; }`],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
