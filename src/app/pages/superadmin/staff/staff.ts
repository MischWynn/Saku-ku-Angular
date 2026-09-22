import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucidePlus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { Staff, CreateStaffRequest, UpdateStaffRequest } from '../../../shared/models/staff.model';
import { STAFF_STATUS_BADGE_STYLES, STAFF_ROLE_LABELS } from '../../../shared/config/staff-status-badge.config';
import { StaffFormModalComponent } from '../../../shared/components/staff-form-modal/staff-form-modal';
import { createDebouncedSearch } from '../../../shared/utils/debounced-search';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, StaffFormModalComponent, LucidePlus, LucidePencil, LucideTrash2],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class StaffComponent {
  protected readonly statusBadge = STAFF_STATUS_BADGE_STYLES;
  protected readonly roleLabel = STAFF_ROLE_LABELS;

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/user`;

  protected readonly staffResource = httpResource<ApiResponse<Staff[]>>(() => this.apiUrl);

  protected readonly search = createDebouncedSearch();

  protected readonly staffList = computed(() => {
    const active = (this.staffResource.value()?.data ?? []).filter((staff) => !staff.deletedDate);
    const term = this.search.term();
    if (!term) return active;
    return active.filter(
      (staff) =>
        staff.namaLengkap.toLowerCase().includes(term) ||
        staff.username.toLowerCase().includes(term) ||
        staff.email.toLowerCase().includes(term)
    );
  });
  protected readonly isLoading = computed(() => this.staffResource.isLoading());
  protected readonly hasError = computed(() => !!this.staffResource.error());

  protected readonly isModalOpen = signal(false);
  protected readonly editingStaff = signal<Staff | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected onSearchInput(event: Event): void {
    this.search.onInput((event.target as HTMLInputElement).value);
  }

  protected initials(namaLengkap: string): string {
    return namaLengkap
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  protected openCreateModal(): void {
    this.editingStaff.set(null);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(staff: Staff): void {
    this.editingStaff.set(staff);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingStaff.set(null);
    this.formError.set(null);
  }

  protected onCreate(payload: CreateStaffRequest): void {
    this.isSubmitting.set(true);
    this.formError.set(null);

    this.http.post<ApiResponse<Staff>>(this.apiUrl, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.staffResource.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.formError.set('Gagal menambahkan staff. Cek kembali data yang diisi.');
      },
    });
  }

  protected onUpdate(event: { id: string; payload: UpdateStaffRequest }): void {
    this.isSubmitting.set(true);
    this.formError.set(null);

    this.http.patch<ApiResponse<Staff>>(`${this.apiUrl}/${event.id}`, event.payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.staffResource.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.formError.set('Gagal menyimpan perubahan. Silakan coba lagi.');
      },
    });
  }

  protected onDelete(staff: Staff): void {
    if (!confirm(`Hapus staff "${staff.namaLengkap}"? Akun ini gak akan bisa login lagi.`)) return;

    this.deletingId.set(staff.id);
    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${staff.id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.staffResource.reload();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Gagal menghapus staff. Silakan coba lagi.');
      },
    });
  }
}
