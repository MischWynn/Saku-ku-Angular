import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LucideUser, LucideMail, LucideSave, LucideKeyRound } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_DISPLAY_NAME } from '../../shared/config/role.config';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideUser, LucideMail, LucideSave, LucideKeyRound],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly isChangingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSuccess = signal<string | null>(null);

  protected readonly roleLabel: Partial<Record<string, string>> = ROLE_DISPLAY_NAME;
  protected readonly currentRole = computed(() => this.authService.currentUser()?.roleName ?? '');

  protected readonly form: FormGroup = this.fb.group({
    namaLengkap: [this.authService.currentUser()?.namaLengkap ?? '', Validators.required],
    email: ['', [Validators.email]],
  });

  protected readonly passwordForm: FormGroup = this.fb.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const namaLengkap: string = this.form.value.namaLengkap;
    const email: string = this.form.value.email;

    this.authService.updateOwnProfile({
      namaLengkap,
      email: email ? email : undefined,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Profil berhasil diperbarui.');
        this.form.patchValue({ email: '' });
        this.authService.fetchCurrentUser().subscribe();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Gagal menyimpan perubahan. Silakan coba lagi.');
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordSuccess.set('Kata sandi berhasil diganti.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Gagal mengganti kata sandi. Cek lagi password lama kamu.');
      },
    });
  }
}
