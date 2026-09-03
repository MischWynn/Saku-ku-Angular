import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { DashboardSummary, ReviewActivity } from '../../../shared/models/dashboard-summary';
import { STATUS_BADGE_STYLES } from '../../../shared/config/status-badge.config';
import { LoanStatus } from '../../../shared/models/loan-application';
import { ActivityFeedComponent } from '../../../shared/components/activity-feed/activity-feed';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ActivityFeedComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})

export class Overview {

  private readonly apiUrl = `${environment.apiUrl}/dashboard/superadmin`;

  protected readonly summaryResource = httpResource<ApiResponse<DashboardSummary>>(
    () => `${this.apiUrl}/summary`
  );
  protected readonly activityResource = httpResource<ApiResponse<ReviewActivity[]>>(
    () => `${this.apiUrl}/aktivitas`
  );

  protected readonly summary = computed(() => this.summaryResource.value()?.data);
  protected readonly activities = computed(() => this.activityResource.value()?.data ?? []);
  protected readonly isLoading = computed(() => this.summaryResource.isLoading());

  protected readonly lineChartData = computed<ChartData<'line'>>(() => {
    const trend = this.summary()?.loanTrend ?? [];
    return {
      labels: trend.map((t) => new Date(t.date).toLocaleDateString('id-ID', { weekday: 'short' })),
      datasets: [
        {
          data: trend.map((t) => t.count),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#10B981',
        },
      ],
    };
  });

  protected readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
    },
  };

  protected readonly donutChartData = computed<ChartData<'doughnut'>>(() => {
    const breakdown = this.summary()?.statusBreakdown ?? [];
    return {
      labels: breakdown.map((b) => STATUS_BADGE_STYLES[b.status as LoanStatus]?.label ?? b.status),
      datasets: [
        {
          data: breakdown.map((b) => b.count),
          backgroundColor: breakdown.map((b) => STATUS_BADGE_STYLES[b.status as LoanStatus]?.color ?? '#64748b'),
          borderWidth: 0,
        },
      ],
    };
  });

  protected readonly donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } },
    },
  };

  protected formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }
}


