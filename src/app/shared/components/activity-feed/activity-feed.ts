import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { ReviewActivity } from '../../models/dashboard-summary';
import { ACTIVITY_ICON_CONFIG, DEFAULT_ACTIVITY_ICON } from '../../config/activity-icon.config';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.css',
})
export class ActivityFeedComponent {
  readonly activities = input.required<ReviewActivity[]>();
  readonly emptyMessage = input<string>('Belum ada aktivitas.');

  protected activityIcon(activity: ReviewActivity) {
    return ACTIVITY_ICON_CONFIG[activity.action] ?? DEFAULT_ACTIVITY_ICON;
  }

  protected shortId(idPengajuan: string): string {
    return `#${idPengajuan.substring(0, 8).toUpperCase()}`;
  }

  protected formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }
}
