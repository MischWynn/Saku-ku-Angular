import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideMail, LucideArrowRight, LucideCopy } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideMail, LucideArrowRight, LucideCopy],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly resetToken = signal<string | null>(null);
  protected readonly submittedEmail = signal('');

  protected readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const email = this.form.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.submittedEmail.set(email);
        this.resetToken.set(res.data ?? null);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Email tidak ditemukan. Cek kembali alamat email kamu.');
      },
    });
  }

  protected goToReset(): void {
    this.router.navigate(['/reset-password'], {
      queryParams: { email: this.submittedEmail(), token: this.resetToken() },
    });
  }
}
