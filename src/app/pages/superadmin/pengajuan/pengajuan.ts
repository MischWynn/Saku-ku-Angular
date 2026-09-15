import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { LoanApplication, LoanStatus } from '../../../shared/models/loan-application';
import { ApiPengajuan, mapApiPengajuanToLoanApplication } from '../../../shared/models/pengajuan-api.model';
import { STATUS_BADGE_STYLES } from '../../../shared/config/status-badge.config';
import { LoanQueueListComponent } from '../../../shared/components/loan-queue-list/loan-queue-list';
import { LoanReviewDrawerComponent } from '../../../shared/components/loan-review-drawer/loan-review-drawer';

@Component({
  selector: 'app-pengajuan',
  standalone: true,
  imports: [CommonModule, LoanQueueListComponent, LoanReviewDrawerComponent],
  templateUrl: './pengajuan.html',
  styleUrl: './pengajuan.css',
})
export class Pengajuan {
  protected readonly statusBadge = STATUS_BADGE_STYLES;
  protected readonly statusOptions = Object.keys(STATUS_BADGE_STYLES) as LoanStatus[];
  protected readonly statusFilter = signal<LoanStatus | 'ALL'>('ALL');
  protected readonly selectedId = signal<string | null>(null);

  private readonly apiUrl = `${environment.apiUrl}/pengajuan`;

  protected readonly pengajuanResource = httpResource<ApiResponse<ApiPengajuan[]>>(() => this.apiUrl);

  protected readonly allItems = computed(() =>
    (this.pengajuanResource.value()?.data ?? []).map(mapApiPengajuanToLoanApplication)
  );

  protected readonly items = computed(() => {
    const filter = this.statusFilter();
    const all = this.allItems();
    return filter === 'ALL' ? all : all.filter((item) => item.status === filter);
  });

  protected readonly selectedItem = computed(
    () => this.items().find((item) => item.id === this.selectedId()) ?? null
  );

  protected readonly isLoading = computed(() => this.pengajuanResource.isLoading());
  protected readonly hasError = computed(() => !!this.pengajuanResource.error());

  protected onFilterChange(value: string): void {
    this.statusFilter.set(value as LoanStatus | 'ALL');
  }

  protected selectItem(item: LoanApplication): void {
    this.selectedId.set(item.id);
  }

  protected closeDrawer(): void {
    this.selectedId.set(null);
  }
}
