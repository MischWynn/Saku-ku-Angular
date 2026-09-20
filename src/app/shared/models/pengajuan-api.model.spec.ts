import { vi } from 'vitest';
import { mapApiPengajuanToLoanApplication, ApiPengajuan } from './pengajuan-api.model';

/**
 * `mapApiPengajuanToLoanApplication()` was previously untested despite being the adapter
 * every review-queue container (marketing/BM/backoffice/superadmin) and the drawer depend on
 * (see CLAUDE.md "Adapter pattern — API asli vs model UI"). It's a pure function, so this
 * exercises it directly with representative `ApiPengajuan` fixtures instead of going through
 * a component + HttpTestingController.
 *
 * `calculateEstInstallment`/`calculateAge` aren't exported (kept as private implementation
 * details of the module), so their behavior is verified indirectly through the public
 * `loan.estInstallment` / `applicant.age` fields on the mapped result — no production code
 * was changed to make this testable.
 */
function buildApiPengajuan(overrides: Partial<ApiPengajuan> = {}): ApiPengajuan {
  return {
    id: 'pengajuan-1',
    status: 'MARKETING_REVIEW',
    nominalPengajuan: 10_000_000,
    nominalDisetujui: null,
    tujuanPinjaman: 'MODAL_USAHA',
    tenor: 12,
    interestRate: 3,
    tanggalPengajuan: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    customer: {
      id: 'customer-1',
      namaLengkap: 'Novita Sari',
      nik: '3201234567890001',
      email: 'novita.sari@mail.com',
      noHp: '081234567890',
      alamat: 'Jl. Merdeka No. 1',
      plafond: 12_000_000,
      status: 'ACTIVE',
      tanggalLahir: '2000-06-15',
      tipePekerjaan: 'KARYAWAN',
      pekerjaan: 'Staff Admin',
      lamaBekerjaBulan: 24,
      pendapatanBulanan: 5_000_000,
      utangBerjalan: 1_000_000,
    },
    bungaTenor: {
      id: 'bunga-tenor-1',
      tenor: 12,
      interestRate: 3,
      status: 'ACTIVE',
    },
    ...overrides,
  };
}

describe('mapApiPengajuanToLoanApplication', () => {
  beforeEach(() => {
    // Fixed "today" so age-from-dob calculations are deterministic across CI runs.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps top-level id/status/loan fields straight through', () => {
    const raw = buildApiPengajuan({ id: 'abc-123', status: 'BM_REVIEW' });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.id).toBe('abc-123');
    expect(result.appId).toBe('abc-123');
    expect(result.status).toBe('BM_REVIEW');
    expect(result.loan.requestedAmount).toBe(raw.nominalPengajuan);
    expect(result.loan.tenorMonths).toBe(raw.tenor);
    expect(result.loan.interestRate).toBe(raw.interestRate);
    expect(result.loan.category).toBe('MODAL_USAHA');
  });

  it('maps applicant identity/contact fields from the nested customer object', () => {
    const raw = buildApiPengajuan();

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.applicant.nik).toBe(raw.customer.nik);
    expect(result.applicant.name).toBe('Novita Sari');
    expect(result.applicant.phone).toBe(raw.customer.noHp);
    expect(result.applicant.address).toBe(raw.customer.alamat);
    expect(result.applicant.employmentType).toBe('KARYAWAN');
    expect(result.applicant.occupation).toBe('Staff Admin');
    expect(result.applicant.employmentLengthMonths).toBe(24);
    expect(result.applicant.monthlyIncome).toBe(5_000_000);
    expect(result.applicant.existingDebts).toBe(1_000_000);
  });

  it('computes age from tanggalLahir against a fixed system date', () => {
    // System time is faked to 2026-09-19. Born 2000-06-15 -> already had this year's
    // birthday (June < Sept), so age = 2026 - 2000 = 26.
    const raw = buildApiPengajuan({
      customer: { ...buildApiPengajuan().customer, tanggalLahir: '2000-06-15' },
    });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.applicant.dob).toBe('2000-06-15');
    expect(result.applicant.age).toBe(26);
  });

  it('does not subtract a year when the birthday has not happened yet this year', () => {
    // System time faked to 2026-09-19. Born 2000-12-25 -> birthday hasn't occurred yet in
    // 2026, so age should be 25, not 26.
    const raw = buildApiPengajuan({
      customer: { ...buildApiPengajuan().customer, tanggalLahir: '2000-12-25' },
    });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.applicant.age).toBe(25);
  });

  it('defaults dob/age/employmentType/occupation/financial fields when the customer data is null (pre-migration data)', () => {
    const raw = buildApiPengajuan({
      customer: {
        ...buildApiPengajuan().customer,
        tanggalLahir: null,
        tipePekerjaan: null,
        pekerjaan: null,
        lamaBekerjaBulan: null,
        pendapatanBulanan: null,
        utangBerjalan: null,
      },
    });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.applicant.dob).toBe('');
    expect(result.applicant.age).toBe(0);
    expect(result.applicant.employmentType).toBe('LAINNYA');
    expect(result.applicant.occupation).toBe('');
    expect(result.applicant.employmentLengthMonths).toBe(0);
    expect(result.applicant.monthlyIncome).toBe(0);
    expect(result.applicant.existingDebts).toBe(0);
  });

  it('defaults loan.category to empty string when tujuanPinjaman is null (pre-migration data)', () => {
    const raw = buildApiPengajuan({ tujuanPinjaman: null });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.loan.category).toBe('');
  });

  it('computes estInstallment using the flat-rate formula: (nominal + nominal*rate/100) / tenor, rounded', () => {
    // nominal=10,000,000, tenor=12, rate=3% -> totalBunga=300,000 -> totalBayar=10,300,000
    // -> 10,300,000 / 12 = 858,333.33... -> rounds to 858,333.
    const raw = buildApiPengajuan({ nominalPengajuan: 10_000_000, tenor: 12, interestRate: 3 });

    const result = mapApiPengajuanToLoanApplication(raw);

    const expected = Math.round((10_000_000 + 10_000_000 * (3 / 100)) / 12);
    expect(result.loan.estInstallment).toBe(expected);
    expect(result.loan.estInstallment).toBe(858_333);
  });

  it('computes estInstallment for a second nominal/tenor/rate combination (regression guard against formula drift)', () => {
    // nominal=8,000,000, tenor=6, rate=3% -> matches the worked example verified live in
    // CLAUDE.md "Plafond system": Est. Installment Rp1.373.333.
    const raw = buildApiPengajuan({ nominalPengajuan: 8_000_000, tenor: 6, interestRate: 3 });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.loan.estInstallment).toBe(1_373_333);
  });

  it('returns estInstallment of 0 when tenor is 0 (guards against divide-by-zero)', () => {
    const raw = buildApiPengajuan({ tenor: 0 });

    const result = mapApiPengajuanToLoanApplication(raw);

    expect(result.loan.estInstallment).toBe(0);
  });
});
