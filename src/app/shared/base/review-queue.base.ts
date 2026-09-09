import { computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { LoanApplication, ReviewActionPayload, UserRole } from '../models/loan-application';
import { ApiPengajuan, mapApiPengajuanToLoanApplication } from '../models/pengajuan-api.model';
import { ROLE_REVIEW_CONFIG } from '../config/review-action.config';
import { QUEUE_ROLE_CONFIG } from '../config/queue-role.config';

/**
 * Shared logic for the 3 per-role "Review Pinjaman" containers (marketing/BM/backoffice).
 * Subclasses only provide `role` + `subtitle`; see DESIGN-DECISIONS.md #3.
 */
export abstract class ReviewQueueBase {
  protected abstract readonly role: Exclude<UserRole, 'SUPERADMIN'>;
  protected abstract readonly subtitle: string;

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pengajuan`;

  protected readonly selectedId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly queueResource = httpResource<ApiResponse<ApiPengajuan[]>>(
    () => `${this.apiUrl}/status/${QUEUE_ROLE_CONFIG[this.role].status}`
  );

  protected readonly items = computed(
    () => (this.queueResource.value()?.data ?? []).map(mapApiPengajuanToLoanApplication)
  );

  protected readonly isLoading = computed(() => this.queueResource.isLoading());

  protected readonly selectedItem = computed(
    () => this.items().find((item) => item.id === this.selectedId()) ?? null
  );

  // Statistik ringkas buat stat strip — dihitung dari items() yang sudah ke-fetch,
  // gak perlu endpoint baru. (Compact stats for the strip — derived from already-fetched
  // items(), no new endpoint needed.)
  protected readonly totalCount = computed(() => this.items().length);

  protected readonly totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.loan.requestedAmount, 0)
  );

  protected readonly avgAmount = computed(() => {
    const count = this.totalCount();
    return count > 0 ? Math.round(this.totalAmount() / count) : 0;
  });

  protected get title(): string {
    return ROLE_REVIEW_CONFIG[this.role].title;
  }

  protected selectItem(item: LoanApplication): void {
    this.selectedId.set(item.id);
    this.errorMessage.set(null);
  }

  protected closeDrawer(): void {
    this.selectedId.set(null);
  }

  protected onActionSubmit(payload: ReviewActionPayload): void {
    const roleConfig = QUEUE_ROLE_CONFIG[this.role];
    const path = payload.action === 'APPROVE' ? roleConfig.approvePath : roleConfig.rejectPath;
    const targetId = this.selectedItem()?.id;
    if (!path || !targetId) return;

    // Backend (PengajuanReviewRequest) cuma punya field `catatan` — dipakai buat approve MAUPUN reject.
    const body: Record<string, unknown> = { catatan: payload.notes ?? '' };
    if (payload.action === 'APPROVE' && payload.nominalDisetujui != null) {
      body['nominalDisetujui'] = payload.nominalDisetujui;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http
      .patch<ApiResponse<LoanApplication>>(`${this.apiUrl}/${targetId}/${path}`, body)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.selectedId.set(null);
          this.queueResource.reload();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Gagal memproses pengajuan. Silakan coba lagi.');
        },
      });
  }
}