import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  LucideAngularModule, 
  WalletCards, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Icon Lucide
  readonly WalletIcon = WalletCards;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ArrowRightIcon = ArrowRight;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

// Helper decode JWT
private decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
  } catch {
    return null;
  }
}

onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set(null);
  localStorage.clear();

  this.authService.login(this.loginForm.value).subscribe({
    next: (res: any) => {
      this.isLoading.set(false);

      if (!res?.token) {
        this.errorMessage.set('Token tidak ditemukan dalam response.');
        return;
      }

      // Simpan token untuk interceptor / guard
      localStorage.setItem('auth_token', res.token);

      // Decode payload dari JWT
      const decoded = this.decodeToken(res.token);
      const rawRole = (decoded?.role || '').toUpperCase();
      console.log('Raw role from JWT:', rawRole);

      // Map singkatan role backend ke UserRole Angular
      let mappedRole: 'superadmin' | 'marketing' | 'branchmanager' | 'backoffice' = 'superadmin';

      switch (rawRole) {
        case 'BM':
        case 'BRANCH_MANAGER':
        case 'BRANCHMANAGER':
          mappedRole = 'branchmanager';
          break;
        case 'MARKETING':
        case 'MKT':
          mappedRole = 'marketing';
          break;
        case 'BACKOFFICE':
        case 'BACK_OFFICE':
        case 'BO':
          mappedRole = 'backoffice';
          break;
        case 'SUPERADMIN':
        case 'ADMIN':
        default:
          mappedRole = 'superadmin';
          break;
      }

      localStorage.setItem('userRole', mappedRole);

      if (mappedRole === 'branchmanager') {
        this.router.navigate(['/branchmanager']);
      } else if (mappedRole === 'marketing') {
        this.router.navigate(['/marketing']);
      } else if (mappedRole === 'backoffice') {
        this.router.navigate(['/backoffice']);
      } else {
        this.router.navigate(['/admin']);
      }
    },
    error: (err) => {
      this.isLoading.set(false);
      this.errorMessage.set(err.error?.message || 'Login gagal. Cek username dan password.');
    }
  });
} 
}