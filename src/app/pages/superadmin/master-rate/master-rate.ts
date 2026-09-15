import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucidePlus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { BungaTenor, BungaTenorRequest } from '../../../shared/models/bunga-tenor.model';
import { BungaTenorFormModalComponent } from '../../../shared/components/bunga-tenor-form-modal/bunga-tenor-form-modal';

@Component({
  selector: 'app-master-rate',
  standalone: true,
  imports: [CommonModule, BungaTenorFormModalComponent, LucidePlus, LucidePencil, LucideTrash2],
  templateUrl: './master-rate.html',
  styleUrl: './master-rate.css',
})
export class MasterRate {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bunga-tenor`;

  protected readonly bungaTenorResource = httpResource<ApiResponse<BungaTenor[]>>(() => this.apiUrl);

  protected readonly bungaTenorList = computed(() =>
    [...(this.bungaTenorResource.value()?.data ?? [])].sort((a, b) => a.tenor - b.tenor)
  );
  protected readonly isLoading = computed(() => this.bungaTenorResource.isLoading());
  protected readonly hasError = computed(() => !!this.bungaTenorResource.error());

  protected readonly isModalOpen = signal(false);
  protected readonly editingBungaTenor = signal<BungaTenor | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected openCreateModal(): void {
    this.editingBungaTenor.set(null);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(bungaTenor: BungaTenor): void {
    this.editingBungaTenor.set(bungaTenor);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingBungaTenor.set(null);
    this.formError.set(null);
  }

  protected onSubmit(payload: BungaTenorRequest): void {
    const editing = this.editingBungaTenor();
    this.isSubmitting.set(true);
    this.formError.set(null);

    const request$ = editing
      ? this.http.patch<ApiResponse<BungaTenor>>(`${this.apiUrl}/${editing.id}`, payload)
      : this.http.post<ApiResponse<BungaTenor>>(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.bungaTenorResource.reload();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err?.error?.message || 'Gagal menyimpan tenor. Silakan coba lagi.');
      },
    });
  }

  protected onDelete(bungaTenor: BungaTenor): void {
    if (!confirm(`Hapus tenor "${bungaTenor.tenor} bulan"? Pengajuan yang udah pakai tenor ini gak akan berubah, tapi opsi ini gak akan muncul lagi buat pengajuan baru.`)) return;

    this.deletingId.set(bungaTenor.id);
    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${bungaTenor.id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.bungaTenorResource.reload();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Gagal menghapus tenor ini. Kemungkinan masih dipakai pengajuan aktif.');
      },
    });
  }
}
