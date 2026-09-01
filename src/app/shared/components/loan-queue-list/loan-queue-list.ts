import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanApplication } from '../../models/loan-application';
import { STATUS_BADGE_STYLES } from '../../config/status-badge.config';

@Component({
  selector: 'app-loan-queue-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-queue-list.html',
  styleUrl: './loan-queue-list.css',
})
export class LoanQueueListComponent {
  readonly title = input<string>('Review Queue');
  readonly subtitle = input<string>('Manage and review incoming credit applications');
  readonly items = input<LoanApplication[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly selectItem = output<LoanApplication>();

  protected readonly statusBadge = STATUS_BADGE_STYLES;
}