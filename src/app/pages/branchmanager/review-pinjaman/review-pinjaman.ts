import { Component } from '@angular/core';
import { LoanQueueListComponent } from '../../../shared/components/loan-queue-list/loan-queue-list';
import { LoanReviewDrawerComponent } from '../../../shared/components/loan-review-drawer/loan-review-drawer';
import { QueueStatsStrip } from '../../../shared/components/queue-stats-strip/queue-stats-strip';
import { ReviewQueueBase } from '../../../shared/base/review-queue.base';

@Component({
  selector: 'app-review-pinjaman',
  standalone: true,
  imports: [LoanQueueListComponent, LoanReviewDrawerComponent, QueueStatsStrip],
  templateUrl: './review-pinjaman.html',
  styleUrl: './review-pinjaman.css',
})
export class ReviewPinjaman extends ReviewQueueBase {
  protected readonly role = 'BM' as const;
  protected readonly subtitle = 'Pengajuan menunggu persetujuan Branch Manager';
}