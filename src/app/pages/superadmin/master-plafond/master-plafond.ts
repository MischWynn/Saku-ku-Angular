import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucidePlus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { Plafond, PlafondRequest } from '../../../shared/models/plafond.model';
import { PlafondFormModalComponent } from '../../../shared/components/plafond-form-modal/plafond-form-modal';

@Component({
  selector: 'app-master-plafond',
  standalone: true,
  imports: [CommonModule, PlafondFormModalComponent, LucidePlus, LucidePencil, LucideTrash2],
  templateUrl: './master-plafond.html',
  styleUrl: './master-plafond.css',
})
export class MasterPlafond {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/plafond`;

  protected readonly plafondResource = httpResource<ApiResponse<Plafond[]>>(() => this.apiUrl);

  protected readonly plafondList = computed(() =>
    [...(this.plafondResource.value()?.data ?? [])].sort((a, b) => a.limitMaksimal - b.limitMaksimal)
  );
  protected readonly isLoading = computed(() => this.plafondResource.isLoading());
  protected readonly hasError = computed(() => !!this.plafondResource.error());

  protected readonly isModalOpen = signal(false);
  protected readonly editingPlafond = signal<Plafond | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected openCreateModal(): void {
    this.editingPlafond.set(null);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(plafond: Plafond): void {
    this.editingPlafond.set(plafond);
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingPlafond.set(null);
    this.formError.set(null);
  }

  protected onSubmit(payload: PlafondRequest): void {
    const editing = this.editingPlafond();
    this.isSubmitting.set(true);
    this.formError.set(null);

    const request$ = editing
      ? this.http.patch<ApiResponse<Plafond>>(`${this.apiUrl}/${editing.idPlafond}`, payload)
      : this.http.post<ApiResponse<Plafond>>(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.plafondResource.reload();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err?.error?.message || 'Gagal menyimpan plafond. Silakan coba lagi.');
      },
    });
  }

  protected onDelete(plafond: Plafond): void {
    if (!confirm(`Hapus tier "${plafond.namaPlafond}"? Customer yang udah ke-assign tier ini bisa kena error.`)) return;

    this.deletingId.set(plafond.idPlafond);
    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${plafond.idPlafond}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.plafondResource.reload();
      },
      error: () => {
        this.deletingId.set(null);
        alert('Gagal menghapus tier ini. Kemungkinan masih dipakai customer aktif.');
      },
    });
  }
}
