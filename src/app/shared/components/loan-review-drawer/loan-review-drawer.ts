import { Component, input, output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { LoanApplication, UserRole, ReviewActionPayload } from '../../models/loan-application';
import { ROLE_REVIEW_CONFIG } from '../../config/review-action.config';
import { STATUS_BADGE_STYLES } from '../../config/status-badge.config';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { ReviewActivity } from '../../models/dashboard-summary';
import { ActivityFeedComponent } from '../activity-feed/activity-feed';

@Component({
  selector: 'app-loan-review-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, ActivityFeedComponent],
  templateUrl: './loan-review-drawer.html',
  styleUrl: './loan-review-drawer.css',
})
export class LoanReviewDrawerComponent {
  readonly item = input<LoanApplication | null>(null);
  readonly role = input<UserRole>('MARKETING');
  readonly submitting = input<boolean>(false);

  readonly close = output<void>();
  readonly actionSubmit = output<ReviewActionPayload>();

  protected noteInput = '';
  protected readonly config = computed(() => ROLE_REVIEW_CONFIG[this.role()]);
  protected readonly statusBadge = STATUS_BADGE_STYLES;

  // Wajib diisi BM pas approve (lihat PengajuanService.bmApprove) — default ke nominal pengajuan,
  // BM boleh turunin tapi backend nolak kalau lebih besar dari itu.
  protected readonly nominalDisetujuiInput = signal<number>(0);
  protected readonly showNominalDisetujui = computed(() => this.role() === 'BM');

  protected readonly employmentLabel = computed(() =>
    this.item()?.applicant.employmentType === 'WIRASWASTA' ? 'Lama Usaha' : 'Lama Bekerja'
  );

  // DBR (Debt Burden Ratio) — cicilan bulanan dibagi pendapatan bulanan. Informational
  // buat bantu keputusan staff, BUKAN hard-block otomatis. null kalau pendapatan_bulanan
  // belum keisi (customer belum lengkapin data) — badge-nya disembunyiin di template.
  protected readonly dbrRatio = computed(() => {
    const app = this.item();
    if (!app || !app.applicant.monthlyIncome) return null;
    return app.loan.estInstallment / app.applicant.monthlyIncome;
  });

  // Riwayat review dari role sebelumnya (mis. catatan Marketing pas BM lagi review) — endpoint
  // udah lama ada di backend (GET /{id}/history), sebelumnya gak pernah dipanggil dari FE manapun.
  private readonly apiUrl = `${environment.apiUrl}/pengajuan`;
  protected readonly historyResource = httpResource<ApiResponse<ReviewActivity[]>>(() => {
    const id = this.item()?.id;
    return id ? `${this.apiUrl}/${id}/history` : undefined;
  });
  protected readonly history = computed(() => this.historyResource.value()?.data ?? []);

  constructor() {
    effect(() => {
      this.nominalDisetujuiInput.set(this.item()?.loan.requestedAmount ?? 0);
    });
  }

  onAction(action: 'APPROVE' | 'REJECT'): void {
    if (this.submitting()) return;
    const current = this.item();
    if (!current) return;
    this.actionSubmit.emit({
      appId: current.appId,
      action,
      notes: this.noteInput,
      nominalDisetujui: this.showNominalDisetujui() && action === 'APPROVE'
        ? this.nominalDisetujuiInput()
        : undefined,
    });
    this.noteInput = '';
  }
}