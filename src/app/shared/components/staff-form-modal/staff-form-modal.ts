import { Component, computed, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { Staff, CreateStaffRequest, UpdateStaffRequest, StaffRole, StaffStatus } from '../../models/staff.model';
import { STAFF_ROLE_LABELS, STAFF_STATUS_BADGE_STYLES } from '../../config/staff-status-badge.config';

@Component({
  selector: 'app-staff-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideX],
  templateUrl: './staff-form-modal.html',
  styleUrl: './staff-form-modal.css',
})
export class StaffFormModalComponent implements OnChanges {
  readonly staff = input<Staff | null>(null);
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly createSubmit = output<CreateStaffRequest>();
  readonly updateSubmit = output<{ id: string; payload: UpdateStaffRequest }>();

  protected readonly roleOptions = Object.keys(STAFF_ROLE_LABELS) as StaffRole[];
  protected readonly statusOptions = Object.keys(STAFF_STATUS_BADGE_STYLES) as StaffStatus[];
  protected readonly roleLabel = STAFF_ROLE_LABELS;

  protected readonly isEditMode = computed(() => !!this.staff());
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Staff' : 'Tambah Staff'));

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    namaLengkap: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    email: ['', [Validators.required, Validators.email]],
    roleName: ['MARKETING' as StaffRole, Validators.required],
    status: ['ACTIVE' as StaffStatus, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('staff' in changes) {
      this.applyStaffToForm(this.staff());
    }
  }

  private applyStaffToForm(staff: Staff | null): void {
    if (staff) {
      this.form.reset({
        namaLengkap: staff.namaLengkap,
        username: staff.username,
        password: '',
        email: staff.email,
        roleName: staff.role.namaRole,
        status: staff.status,
      });
      this.form.controls.username.disable();
      this.form.controls.password.clearValidators();
    } else {
      this.form.reset({
        namaLengkap: '',
        username: '',
        password: '',
        email: '',
        roleName: 'MARKETING',
        status: 'ACTIVE',
      });
      this.form.controls.username.enable();
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const current = this.staff();

    if (current) {
      this.updateSubmit.emit({
        id: current.id,
        payload: {
          namaLengkap: value.namaLengkap,
          email: value.email,
          status: value.status,
          roleName: value.roleName,
        },
      });
    } else {
      this.createSubmit.emit({
        namaLengkap: value.namaLengkap,
        username: value.username,
        password: value.password,
        email: value.email,
        roleName: value.roleName,
      });
    }
  }
}
