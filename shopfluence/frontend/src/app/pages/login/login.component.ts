import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 60% 0%, #3b0764 0%, #0d0b1e 70%); padding: 20px;">
      <mat-card style="width: 100%; max-width: 420px; padding: 40px; background: #1a1535 !important;">
        <div style="text-align: center; margin-bottom: 32px;">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: #5b21b6;">shopping_bag</mat-icon>
          <h1 style="font-size: 28px; font-weight: 700; margin: 8px 0 4px; background: linear-gradient(135deg, #5b21b6, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Shopfluence</h1>
          <p style="color: #a78bca; font-size: 14px;">Shop what your favourite creators love</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 8px;">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@example.com">
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="showPw ? 'text' : 'password'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="showPw = !showPw">
              <mat-icon>{{ showPw ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loading" style="width: 100%; height: 48px; font-size: 16px; font-weight: 600;">
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <p style="text-align: center; margin-top: 24px; color: #a78bca; font-size: 14px;">
          Don't have an account? <a routerLink="/register" style="color: #c084fc; font-weight: 600;">Create one</a>
        </p>

        <div style="margin-top: 24px; padding: 16px; background: rgba(167,139,202,0.1); border: 1px solid rgba(167,139,202,0.2); border-radius: 8px; font-size: 13px; color: #a78bca;">
          <strong>Demo account:</strong><br>
          Email: demo&#64;shopfluence.com<br>
          Password: demo123
        </div>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  form = this.fb.group({
    email: ['demo@shopfluence.com', [Validators.required, Validators.email]],
    password: ['demo123', Validators.required],
  });
  loading = false;
  showPw = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => {
        this.snack.open(e.error?.message || 'Invalid credentials', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
