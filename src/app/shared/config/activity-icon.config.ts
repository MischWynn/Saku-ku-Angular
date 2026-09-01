import {
  LucideCheckCircle2,
  LucideXCircle,
  LucideWallet,
  LucideFileSearch,
  LucideCircle,
} from '@lucide/angular';

export interface ActivityIconConfig {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
}

export const ACTIVITY_ICON_CONFIG: Record<string, ActivityIconConfig> = {
  APPROVE: {
    icon: LucideCheckCircle2,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    title: 'Persetujuan Pengajuan',
  },
  REJECT: {
    icon: LucideXCircle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    title: 'Penolakan Pengajuan',
  },
  DISBURSE: {
    icon: LucideWallet,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    title: 'Pencairan Dana',
  },
  REVIEW: {
    icon: LucideFileSearch,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    title: 'Review Pengajuan',
  },
};

export const DEFAULT_ACTIVITY_ICON: ActivityIconConfig = {
  icon: LucideCircle,
  iconBg: 'bg-slate-500/15',
  iconColor: 'text-slate-400',
  title: 'Aktivitas Pengajuan',
};