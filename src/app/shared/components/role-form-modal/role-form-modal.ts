import { Component, computed, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { Role, RoleRequest } from '../../models/role.model';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideX],
  templateUrl: './role-form-modal.html',
  styleUrl: './role-form-modal.css',
})
export class RoleFormModalComponent implements OnChanges {
  readonly role = input<Role | null>(null);
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitForm = output<RoleRequest>();

  protected readonly isEditMode = computed(() => !!this.role());
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Role' : 'Tambah Role'));

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    nama: ['', Validators.required],
    description: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('role' in changes) {
      const role = this.role();
      this.form.reset({
        nama: role?.namaRole ?? '',
        description: role?.description ?? '',
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
