import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { ReviewActivity } from '../../../shared/models/dashboard-summary';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed';

@Component({
  selector: 'app-riwayat-review',
  standalone: true,
  imports: [CommonModule, ActivityFeedComponent],
  templateUrl: './riwayat-review.html',
  styleUrl: './riwayat-review.css',
})
export class RiwayatReview {
  private readonly apiUrl = `${environment.apiUrl}/review-log/me`;

  protected readonly historyResource = httpResource<ApiResponse<ReviewActivity[]>>(() => this.apiUrl);

  protected readonly history = computed(() => this.historyResource.value()?.data ?? []);
  protected readonly isLoading = computed(() => this.historyResource.isLoading());
}
