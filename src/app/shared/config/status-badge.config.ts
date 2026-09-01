import { LoanStatus } from '../models/loan-application';

export const STATUS_BADGE_STYLES: Record<LoanStatus, { label: string; classes: string; color: string }> = {
  MARKETING_REVIEW:  { label: 'Marketing Review',   classes: 'bg-amber-500/10 text-amber-300 border-amber-500/30', color: '#eab308' },
  BM_REVIEW:          { label: 'BM Review',           classes: 'bg-sky-500/10 text-sky-300 border-sky-500/30', color: '#38bdf8' },
  BACKOFFICE_REVIEW:  { label: 'Backoffice Review',   classes: 'bg-emerald-300/10 text-emerald-200 border-emerald-300/30', color: '#6EE7B7' },
  DISBURSED:          { label: 'Disbursed',           classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', color: '#10B981' },
  MARKETING_REJECTED: { label: 'Ditolak Marketing',   classes: 'bg-red-500/10 text-red-300 border-red-500/30', color: '#f87171' },
  BM_REJECTED:         { label: 'Ditolak BM',           classes: 'bg-red-500/10 text-red-300 border-red-500/30', color: '#fb7185' },
  CANCELLED:          { label: 'Cancelled',           classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30', color: '#94a3b8' },
};