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
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #5b21b6 0%, #9333ea 100%); padding: 20px;">
      <mat-card style="width: 100%; max-width: 420px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: #5b21b6;">shopping_bag</mat-icon>
          <h1 style="font-size: 28px; font-weight: 700; margin: 8px 0 4px;">Join Shopfluence</h1>
          <p style="color: #666; font-size: 14px;">Discover products from creators you love</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 8px;">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="name" placeholder="Your name">
          </mat-form-field>

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
            <mat-hint>At least 6 characters</mat-hint>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loading" style="width: 100%; height: 48px; font-size: 16px; font-weight: 600;">
            {{ loading ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <p style="text-align: center; margin-top: 24px; color: #666; font-size: 14px;">
          Already have an account? <a routerLink="/login" style="color: #5b21b6; font-weight: 600;">Sign in</a>
        </p>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  showPw = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { name, email, password } = this.form.value;
    this.auth.register(email!, password!, name!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => {
        this.snack.open(e.error?.message || 'Registration failed', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
