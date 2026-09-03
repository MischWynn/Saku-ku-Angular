import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucidePlus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { Menu, MenuRequest } from '../../../shared/models/menu.model';
import { MenuFormModalComponent } from '../../../shared/components/menu-form-modal/menu-form-modal';

@Component({
  selector: 'app-master-menu',
  standalone: true,
  imports: [CommonModule, MenuFormModalComponent, LucidePlus, LucidePencil, LucideTrash2],
  templateUrl: './master-menu.html',
  styleUrl: './master-menu.css',
})
export class MasterMenu {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menu`;

  protected readonly menuResource = httpResource<ApiResponse<Menu[]>>(() => this.apiUrl);

  protected readonly menuList = computed(() =>
    [...(this.menuResource.value()?.data ?? [])].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  );
  protected readonly isLoading = computed(() => this.menuResource.isLoading());
  protected readonly hasError = computed(() => !!this.menuResource.error());

  protected readonly isModalOpen = signal(false);
  protected readonly editingMenu = signal<Menu | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected parentName(parentId: string | null): string {
    if (!parentId) return '—';
    return this.menuList().find((m) => m.id === parentId)?.namaMenu ?? '—';
  }

  protected openCreateModal(): void {
    this.editingMenu.set(null);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(menu: Menu): void {
    this.editingMenu.set(menu);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingMenu.set(null);
    this.formError.set(null);
  }

  protected onSubmit(payload: MenuRequest): void {
    const editing = this.editingMenu();
    this.isSubmitting.set(true);
    this.formError.set(null);

    const request$ = editing
      ? this.http.patch<ApiResponse<Menu>>(`${this.apiUrl}/${editing.id}`, payload)
      : this.http.post<ApiResponse<Menu>>(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.menuResource.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.formError.set(editing ? 'Gagal menyimpan perubahan. Silakan coba lagi.' : 'Gagal menambahkan menu. Cek kembali data yang diisi.');
      },
    });
  }

  protected onDelete(menu: Menu): void {
    if (!confirm(`Hapus menu "${menu.namaMenu}"? Access control yang nempel di menu ini juga bakal ikut hilang.`)) return;

    this.deletingId.set(menu.id);
    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${menu.id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.menuResource.reload();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Gagal menghapus menu. Silakan coba lagi.');
      },
    });
  }
}
