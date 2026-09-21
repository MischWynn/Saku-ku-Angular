import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideMail, LucideLock, LucideEye, LucideEyeOff, LucideArrowRight } from '@lucide/angular';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { toSidebarRole } from '../../../shared/config/role.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideMail, LucideLock, LucideEye, LucideEyeOff, LucideArrowRight],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showPassword = signal(false);
  isLoading = signal(false);
  // Prefill dari query param ?sessionExpired=true - dikirim authInterceptor pas 401 karena token
  // basi (lihat auth.interceptor.ts), reuse alert error yang udah ada di template daripada bikin
  // komponen toast baru.
  errorMessage = signal<string | null>(
    this.route.snapshot.queryParamMap.get('sessionExpired') === 'true'
      ? 'Sesi Anda telah berakhir, silakan masuk kembali'
      : null
  );

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    localStorage.clear();

    this.authService.login(this.loginForm.value).pipe(
      switchMap(() => this.authService.fetchCurrentUser())
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const businessRole = res.data?.roleName;
        if (!businessRole) {
          this.errorMessage.set('Gagal mengambil profil user.');
          return;
        }

        this.authService.fetchMyMenuAccess().subscribe();

        const sidebarRole = toSidebarRole(businessRole);
        switch (sidebarRole) {
          case 'branchmanager': this.router.navigate(['/branchmanager']); break;
          case 'marketing': this.router.navigate(['/marketing']); break;
          case 'backoffice': this.router.navigate(['/backoffice']); break;
          default: this.router.navigate(['/admin']); break;
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login gagal. Cek username dan password.');
      }
    });
  }
}