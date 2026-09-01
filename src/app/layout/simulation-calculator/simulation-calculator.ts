import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideSlidersHorizontal } from '@lucide/angular';

@Component({
  selector: 'app-loan-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideSlidersHorizontal ],

  templateUrl: './simulation-calculator.html',
  styleUrl: './simulation-calculator.css'
})
export class LoanSimulationComponent {

  loanAmount: number = 10000000;
  tenorMonths: number = 12;

  // Mapping Tenor -> Suku Bunga (%)
  readonly interestRateMap: Record<number, number> = {
    6: 3.0,
    12: 8.0,
    18: 10.0,
    24: 12.0
  };

  readonly tenorOptions: number[] = [6, 12, 18, 24];

  // Bunga saat ini sesuai tenor yang dipilih
  get currentInterestRate(): number {
    return this.interestRateMap[this.tenorMonths] ?? 8.0;
  }

  // Pokok Pinjaman per Bulan
  get principalPerMonth(): number {
    return this.loanAmount / this.tenorMonths;
  }

  // Bunga per Bulan (Rate tahunan dibagi 12)
  get interestPerMonth(): number {
    const monthlyRate = (this.currentInterestRate / 100) / 12;
    return this.loanAmount * monthlyRate;
  }

  // Angsuran Total per Bulan
  get monthlyInstallment(): number {
    return this.principalPerMonth + this.interestPerMonth;
  }

  // Total Pengembalian
  get totalRepayment(): number {
    return this.monthlyInstallment * this.tenorMonths;
  }

  // Total Seluruh Bunga
  get totalInterest(): number {
    return this.interestPerMonth * this.tenorMonths;
  }

  setTenor(months: number): void {
    this.tenorMonths = months;
  }
}