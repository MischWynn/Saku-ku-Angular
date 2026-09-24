import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { LucideSlidersHorizontal } from '@lucide/angular';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response';
import { BungaTenor } from '../../shared/models/bunga-tenor.model';
import { Plafond } from '../../shared/models/plafond.model';

interface TenorOption {
  tenor: number;
  interestRate: number;
}

interface TenorResult extends TenorOption {
  cicilan: number;
  totalBunga: number;
  total: number;
}

const FALLBACK_TENORS: TenorOption[] = [
  { tenor: 6, interestRate: 3 },
  { tenor: 12, interestRate: 8 },
  { tenor: 18, interestRate: 10 },
  { tenor: 24, interestRate: 12 },
];
const MIN_NOMINAL = 500_000;
const DEFAULT_MAX_NOMINAL = 50_000_000;
const NOMINAL_STEP = 500_000;

function estimate(nominal: number, option: TenorOption): TenorResult {
  const totalBunga = nominal * (option.interestRate / 100);
  const total = nominal + totalBunga;
  return { ...option, totalBunga, total, cicilan: total / option.tenor };
}

@Component({
  selector: 'app-loan-simulation',
  standalone: true,
  imports: [DecimalPipe, LucideSlidersHorizontal],
  templateUrl: './simulation-calculator.html',
  styleUrl: './simulation-calculator.css',
})
export class LoanSimulationComponent {
  private readonly tenorResource = httpResource<ApiResponse<BungaTenor[]>>(
    () => `${environment.apiUrl}/bunga-tenor`
  );
  private readonly plafondResource = httpResource<ApiResponse<Plafond[]>>(
    () => `${environment.apiUrl}/plafond`
  );

  protected readonly minNominal = MIN_NOMINAL;
  protected readonly nominalStep = NOMINAL_STEP;

  protected readonly tenorOptions = computed<TenorOption[]>(() => {
    const data = this.tenorResource.hasValue() ? this.tenorResource.value()?.data : undefined;
    const active = (data ?? [])
      .filter((t) => t.status === 'ACTIVE')
      .map((t) => ({ tenor: t.tenor, interestRate: t.interestRate }))
      .sort((a, b) => a.tenor - b.tenor);
    return active.length ? active : FALLBACK_TENORS;
  });

  protected readonly maxNominal = computed(() => {
    const data = this.plafondResource.hasValue() ? this.plafondResource.value()?.data : undefined;
    const limits = (data ?? []).filter((p) => p.status === 'ACTIVE').map((p) => p.limitMaksimal);
    return limits.length ? Math.max(...limits) : DEFAULT_MAX_NOMINAL;
  });

  private readonly rawNominal = signal(10_000_000);
  private readonly pickedTenor = signal<number | null>(null);

  protected readonly nominal = computed(() =>
    Math.min(Math.max(this.rawNominal(), MIN_NOMINAL), this.maxNominal())
  );

  // Seberapa jauh thumb slider dari kiri (0-100) - dipakai CSS buat ngewarnain bagian track
  // yang udah "keisi", karena accent-color gak konsisten di semua browser.
  protected readonly sliderFillPercent = computed(() => {
    const range = this.maxNominal() - MIN_NOMINAL;
    return range > 0 ? ((this.nominal() - MIN_NOMINAL) / range) * 100 : 0;
  });

  protected readonly selectedTenor = computed(() => {
    const options = this.tenorOptions();
    const picked = this.pickedTenor();
    if (picked !== null && options.some((o) => o.tenor === picked)) return picked;
    return options.find((o) => o.tenor === 12)?.tenor ?? options[0].tenor;
  });

  protected readonly results = computed(() => this.tenorOptions().map((o) => estimate(this.nominal(), o)));

  protected readonly selected = computed(
    () => this.results().find((r) => r.tenor === this.selectedTenor()) ?? this.results()[0]
  );

  protected readonly lightestTenor = computed(
    () => this.results().reduce((a, b) => (b.cicilan < a.cicilan ? b : a)).tenor
  );
  protected readonly cheapestTenor = computed(
    () => this.results().reduce((a, b) => (b.totalBunga < a.totalBunga ? b : a)).tenor
  );

  protected readonly pokokPercent = computed(() => {
    const s = this.selected();
    return s.total > 0 ? Math.round((this.nominal() / s.total) * 100) : 100;
  });

  protected setNominal(value: number): void {
    if (!Number.isNaN(value)) this.rawNominal.set(value);
  }

  protected onNominalTyped(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.setNominal(Number(digits || 0));
  }

  protected onSliderInput(event: Event): void {
    this.setNominal(Number((event.target as HTMLInputElement).value));
  }

  protected selectTenor(tenor: number): void {
    this.pickedTenor.set(tenor);
  }
}
