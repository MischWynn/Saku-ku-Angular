import { StaffStatus } from '../models/staff.model';

export const STAFF_STATUS_BADGE_STYLES: Record<StaffStatus, { label: string; classes: string }> = {
  ACTIVE:   { label: 'Aktif',      classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  INACTIVE: { label: 'Nonaktif',   classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  BLOCKED:  { label: 'Diblokir',   classes: 'bg-red-500/10 text-red-300 border-red-500/30' },
};

export const STAFF_ROLE_LABELS: Partial<Record<string, string>> = {
  SUPERADMIN: 'Superadmin',
  MARKETING: 'Marketing',
  BM: 'Branch Manager',
  BACK_OFFICE: 'Back Office',
};
