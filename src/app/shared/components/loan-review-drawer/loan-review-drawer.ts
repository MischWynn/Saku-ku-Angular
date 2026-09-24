import { Component, input, output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { LoanApplication, UserRole, ReviewActionPayload, EMPLOYMENT_TYPE_LABELS } from '../../models/loan-application';
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

  // Sektor/bidang kerja (ASN, BUMN, Swasta, dst) - gantiin Lama Bekerja/Lama Usaha yang
  // sementara disembunyiin dari section Employment & Financial.
  protected readonly employmentSector = computed(() => {
    const type = this.item()?.applicant.employmentType;
    return type ? (EMPLOYMENT_TYPE_LABELS[type] ?? type) : '-';
  });

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

  // Foto KTP — endpoint terpisah (base64 bisa ratusan KB), sengaja LAZY: baru di-fetch kalau
  // staff eksplisit klik "Lihat Foto KTP", bukan otomatis tiap drawer dibuka.
  protected readonly showKtpPhoto = signal(false);
  protected readonly ktpResource = httpResource<ApiResponse<string | null>>(() => {
    const id = this.item()?.id;
    return this.showKtpPhoto() && id ? `${this.apiUrl}/${id}/ktp` : undefined;
  });
  protected readonly ktpPhotoUrl = computed(() => {
    const base64 = this.ktpResource.value()?.data;
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  });
  protected readonly ktpLoading = computed(() => this.showKtpPhoto() && this.ktpResource.isLoading());
  protected readonly ktpNotFound = computed(
    () => this.showKtpPhoto() && !this.ktpResource.isLoading() && !this.ktpPhotoUrl()
  );

  constructor() {
    effect(() => {
      const current = this.item();
      this.nominalDisetujuiInput.set(current?.loan.requestedAmount ?? 0);
      // Reset viewer foto tiap ganti item, biar gak nyisain foto customer sebelumnya kebuka.
      this.showKtpPhoto.set(false);
    });
  }

  protected viewKtpPhoto(): void {
    this.showKtpPhoto.set(true);
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