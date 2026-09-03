import { LoanApplication, LoanStatus } from './loan-application';

/**
 * Bentuk ASLI response dari GET /api/v1/pengajuan/status/{status}.
 * Ini beda dari `LoanApplication` (yang dirancang untuk field pasca-migration,
 * lihat sakuku-migration-customer-pengajuan-fields.sql — belum dieksekusi).
 * Field employment/income/dob dsb BELUM ada di backend sekarang.
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
  };
  bungaTenor: {
    id: string;
    tenor: number;
    interestRate: number;
    status: string;
  };
}

/**
 * Adapter: API asli -> shape LoanApplication yang dipakai komponen (queue-list, drawer).
 * Field yang belum ada di backend (dob, age, employmentType, dst) diisi placeholder
 * aman sampai migration jalan — TODO: hapus placeholder ini begitu migration dieksekusi
 * dan backend beneran ngirim field-field itu.
 */
export function mapApiPengajuanToLoanApplication(raw: ApiPengajuan): LoanApplication {
  return {
    id: raw.id,
    appId: raw.id,
    status: raw.status,
    applicant: {
      nik: raw.customer.nik,
      name: raw.customer.namaLengkap,
      avatarUrl: undefined,
      dob: '',                 // TODO: belum ada di backend (nunggu migration tanggal_lahir)
      age: 0,                  // TODO: belum ada di backend
      phone: raw.customer.noHp,
      address: raw.customer.alamat,
      employmentType: 'LAINNYA', // TODO: belum ada di backend (nunggu migration tipe_pekerjaan)
      occupation: '',           // TODO: belum ada di backend
      employmentLengthMonths: 0, // TODO: belum ada di backend
      monthlyIncome: 0,          // TODO: belum ada di backend
      existingDebts: 0,          // TODO: belum ada di backend
    },
    loan: {
      requestedAmount: raw.nominalPengajuan,
      category: raw.tujuanPinjaman ?? '',
      tenorMonths: raw.tenor,
      interestRate: raw.interestRate,
      estInstallment: 0,        // TODO: cek apakah backend sudah hitung ini di tempat lain
    },
  };
}