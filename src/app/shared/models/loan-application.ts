export type UserRole = 'MARKETING' | 'BM' | 'BACK_OFFICE' | 'SUPERADMIN';
export type EmploymentType = 'KARYAWAN' | 'WIRASWASTA' | 'PNS' | 'LAINNYA';
export type LoanStatus =
  | 'MARKETING_REVIEW'
  | 'BM_REVIEW'
  | 'BACKOFFICE_REVIEW'
  | 'DISBURSED'
  | 'MARKETING_REJECTED'
  | 'BM_REJECTED'
  | 'CANCELLED';
  
export interface ApplicantDetail {
  nik: string;
  name: string;
  avatarUrl?: string;
  dob: string;
  age: number;
  phone: string;
  address: string;
  employmentType: EmploymentType;
  occupation: string;        // teks bebas, display only
  employmentLengthMonths: number;  // generik: lama kerja ATAU lama usaha
  monthlyIncome: number;
  existingDebts: number;
}

export interface LoanDetail {
  requestedAmount: number;
  category: string;          // tujuan_pinjaman: MODAL_USAHA, KONSUMTIF, dst
  tenorMonths: number;
  interestRate: number;
  estInstallment: number;    // dihitung client-side (flat rate) — lihat pengajuan-api.model.ts
}

export interface LoanApplication {
  id: string;
  appId: string;
  status: LoanStatus;
  applicant: ApplicantDetail;
  loan: LoanDetail;
}

export interface ReviewActionPayload {
  appId: string;
  action: 'APPROVE' | 'REJECT';
  notes?: string;
  nominalDisetujui?: number; // wajib diisi BM pas approve — lihat PengajuanService.bmApprove()
}