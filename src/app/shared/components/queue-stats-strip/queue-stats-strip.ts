import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-queue-stats-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue-stats-strip.html',
  styleUrl: './queue-stats-strip.css',  
})

export class QueueStatsStrip {
  readonly totalCount = input<number>(0);
  readonly totalAmount = input<number>(0);
  readonly avgAmount = input<number>(0);
}