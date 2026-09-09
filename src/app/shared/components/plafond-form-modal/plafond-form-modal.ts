import { Component, computed, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { Plafond, PlafondRequest, PlafondStatus } from '../../models/plafond.model';

@Component({
  selector: 'app-plafond-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideX],
  templateUrl: './plafond-form-modal.html',
  styleUrl: './plafond-form-modal.css',
})
export class PlafondFormModalComponent implements OnChanges {
  readonly plafond = input<Plafond | null>(null);
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitForm = output<PlafondRequest>();

  protected readonly isEditMode = computed(() => !!this.plafond());
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Plafond' : 'Tambah Plafond'));

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    namaPlafond: ['', Validators.required],
    deskripsi: [''],
    tipe: [''],
    limitMaksimal: [0, [Validators.required, Validators.min(1)]],
    status: ['ACTIVE' as PlafondStatus],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('plafond' in changes) {
      const plafond = this.plafond();
      this.form.reset({
        namaPlafond: plafond?.namaPlafond ?? '',
        deskripsi: plafond?.deskripsi ?? '',
        tipe: plafond?.tipe ?? '',
        limitMaksimal: plafond?.limitMaksimal ?? 0,
        status: plafond?.status ?? 'ACTIVE',
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
