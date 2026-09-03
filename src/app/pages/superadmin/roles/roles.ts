import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucidePlus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { Role, RoleRequest } from '../../../shared/models/role.model';
import { RoleFormModalComponent } from '../../../shared/components/role-form-modal/role-form-modal';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RoleFormModalComponent, LucidePlus, LucidePencil, LucideTrash2],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/role`;

  protected readonly rolesResource = httpResource<ApiResponse<Role[]>>(() => this.apiUrl);

  protected readonly roleList = computed(() =>
    (this.rolesResource.value()?.data ?? []).filter((role) => !role.deletedDate)
  );
  protected readonly isLoading = computed(() => this.rolesResource.isLoading());
  protected readonly hasError = computed(() => !!this.rolesResource.error());

  protected readonly isModalOpen = signal(false);
  protected readonly editingRole = signal<Role | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected openCreateModal(): void {
    this.editingRole.set(null);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(role: Role): void {
    this.editingRole.set(role);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingRole.set(null);
    this.formError.set(null);
  }

  protected onSubmit(payload: RoleRequest): void {
    const editing = this.editingRole();
    this.isSubmitting.set(true);
    this.formError.set(null);

    const request$ = editing
      ? this.http.patch<ApiResponse<Role>>(`${this.apiUrl}/${editing.id}`, payload)
      : this.http.post<ApiResponse<Role>>(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.rolesResource.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.formError.set(editing ? 'Gagal menyimpan perubahan. Silakan coba lagi.' : 'Gagal menambahkan role. Cek kembali data yang diisi.');
      },
    });
  }

  protected onDelete(role: Role): void {
    if (!confirm(`Hapus role "${role.namaRole}"? Role yang masih dipakai staff aktif gak bisa dihapus.`)) return;

    this.deletingId.set(role.id);
    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${role.id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.rolesResource.reload();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Gagal menghapus role. Kemungkinan role ini masih dipakai staff aktif.');
      },
    });
  }
}
