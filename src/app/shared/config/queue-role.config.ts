import { LoanStatus, UserRole } from '../models/loan-application';

export interface QueueRoleConfig {
  status: LoanStatus;
  approvePath: string;
  rejectPath?: string;
}

// SUPERADMIN gak pernah pakai config ini — dia gak punya status queue sendiri
// (List Request Pinjaman ambil semua status sekaligus, bukan lewat queue per role).
export const QUEUE_ROLE_CONFIG: Record<Exclude<UserRole, 'SUPERADMIN'>, QueueRoleConfig> = {
  MARKETING: {
    status: 'MARKETING_REVIEW',
    approvePath: 'marketing-approve',
    rejectPath: 'marketing-reject',
  },
  BM: {
    status: 'BM_REVIEW',
    approvePath: 'bm-approve',
    rejectPath: 'bm-reject',
  },
  BACK_OFFICE: {
    status: 'BACKOFFICE_REVIEW',
    approvePath: 'disburse',
    // Backend belum punya endpoint reject untuk Back Office.
  },
};
