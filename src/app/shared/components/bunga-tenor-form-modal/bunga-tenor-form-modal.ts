import { Component, computed, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { BungaTenor, BungaTenorRequest, BungaTenorStatus } from '../../models/bunga-tenor.model';

@Component({
  selector: 'app-bunga-tenor-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideX],
  templateUrl: './bunga-tenor-form-modal.html',
  styleUrl: './bunga-tenor-form-modal.css',
})
export class BungaTenorFormModalComponent implements OnChanges {
  readonly bungaTenor = input<BungaTenor | null>(null);
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitForm = output<BungaTenorRequest>();

  protected readonly isEditMode = computed(() => !!this.bungaTenor());
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Tenor' : 'Tambah Tenor'));

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    tenor: [0, [Validators.required, Validators.min(1)]],
    interestRate: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE' as BungaTenorStatus],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('bungaTenor' in changes) {
      const bungaTenor = this.bungaTenor();
      this.form.reset({
        tenor: bungaTenor?.tenor ?? 0,
        interestRate: bungaTenor?.interestRate ?? 0,
        status: bungaTenor?.status ?? 'ACTIVE',
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitForm.emit(this.form.getRawValue());
  }
}
