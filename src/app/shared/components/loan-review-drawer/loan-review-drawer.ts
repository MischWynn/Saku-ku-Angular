import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApplication, UserRole, ReviewActionPayload } from '../../models/loan-application';
import { ROLE_REVIEW_CONFIG } from '../../config/review-action.config';

@Component({
  selector: 'app-loan-review-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  protected readonly employmentLabel = computed(() =>
    this.item()?.applicant.employmentType === 'WIRASWASTA' ? 'Lama Usaha' : 'Lama Bekerja'
  );

  onAction(action: 'APPROVE' | 'REJECT'): void {
    if (this.submitting()) return;
    const current = this.item();
    if (!current) return;
    this.actionSubmit.emit({ appId: current.appId, action, notes: this.noteInput });
    this.noteInput = '';
  }
}