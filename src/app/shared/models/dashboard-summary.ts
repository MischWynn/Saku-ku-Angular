export interface LoanTrendPoint {
  date: string;
  count: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}

export interface DashboardSummary {
  totalPengajuan: number;
  menungguReview: number;
  menungguApproval: number;
  siapDicairkan: number;
  totalDanaCair: number;
  loanTrend: LoanTrendPoint[];
  statusBreakdown: StatusBreakdownItem[];
}

export interface ReviewActivity {
  id: string;
  action: string;
  statusFrom: string;
  statusTo: string;
  catatan: string | null;
  createdAt: string;
  pengajuan: { 
    id: string; 
    nominalPengajuan: number; 
    nominalDisetujui?: number| null;
    customer: { namaLengkap: string } 
  };
  user: { namaLengkap: string };
}