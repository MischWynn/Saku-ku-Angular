import { EmploymentType, LoanApplication, LoanStatus } from './loan-application';

/**
 * Bentuk ASLI response dari GET /api/v1/pengajuan/status/{status}.
 * Ini beda dari `LoanApplication` (yang dirancang untuk field pasca-migration).
 * Field customer (dob, employment, income) ditambah 3 Sept 2026 — lihat CLAUDE.md
 * "Migration field tbl_customer". `estInstallment` dihitung client-side (flat rate,
 * lihat calculateEstInstallment) — backend gak pernah ngitung ini di mana pun.
 */
export interface ApiPengajuan {
  id: string;
  status: LoanStatus;
  nominalPengajuan: number;
  nominalDisetujui: number | null;
  tujuanPinjaman: string | null;
  tenor: number;
  interestRate: number;
  tanggalPengajuan: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    namaLengkap: string;
    nik: string;
    email: string;
    noHp: string;
    alamat: string;
    plafond: number;
    status: string;
    tanggalLahir: string | null;
    tipePekerjaan: string | null;
    pekerjaan: string | null;
    lamaBekerjaBulan: number | null;
    pendapatanBulanan: number | null;
    utangBerjalan: number | null;
  };
  bungaTenor: {
    id: string;
    tenor: number;
    interestRate: number;
    status: string;
  };
}

/**
 * Estimasi cicilan bulanan — flat rate (bunga dihitung sekali dari nominal, bukan
 * reducing-balance), dibagi rata ke tenor. Dipakai juga buat DBR check di drawer
 * (lihat loan-review-drawer.ts). Backend belum pernah hitung ini di mana pun.
 */
function calculateEstInstallment(nominal: number, tenor: number, interestRate: number): number {
  if (tenor <= 0) return 0;
  const totalBunga = nominal * (interestRate / 100);
  const totalBayar = nominal + totalBunga;
  return Math.round(totalBayar / tenor);
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Adapter: API asli -> shape LoanApplication yang dipakai komponen (queue-list, drawer).
 * `estInstallment` masih placeholder (belum dihitung backend) — sisanya udah data asli.
 */
export function mapApiPengajuanToLoanApplication(raw: ApiPengajuan): LoanApplication {
  const dob = raw.customer.tanggalLahir ?? '';
  return {
    id: raw.id,
    appId: raw.id,
    status: raw.status,
    applicant: {
      nik: raw.customer.nik,
      name: raw.customer.namaLengkap,
      avatarUrl: undefined,
      dob,
      age: dob ? calculateAge(dob) : 0,
      phone: raw.customer.noHp,
      address: raw.customer.alamat,
      employmentType: (raw.customer.tipePekerjaan as EmploymentType) ?? 'LAINNYA',
      occupation: raw.customer.pekerjaan ?? '',
      employmentLengthMonths: raw.customer.lamaBekerjaBulan ?? 0,
      monthlyIncome: raw.customer.pendapatanBulanan ?? 0,
      existingDebts: raw.customer.utangBerjalan ?? 0,
    },
    loan: {
      requestedAmount: raw.nominalPengajuan,
      category: raw.tujuanPinjaman ?? '',
      tenorMonths: raw.tenor,
      interestRate: raw.interestRate,
      estInstallment: calculateEstInstallment(raw.nominalPengajuan, raw.tenor, raw.interestRate),
    },
  };
}