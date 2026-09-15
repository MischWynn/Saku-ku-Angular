import {
  LucideLayoutGrid,
  LucideClipboardList,
  LucideMessageSquareDiff,
  LucideUsers,
  LucideLayers,
  LucideShieldCheck,
  LucideHistory,
  LucideWallet,
  LucidePercent,
} from '@lucide/angular';

export type SidebarRole = 'superadmin' | 'marketing' | 'branchmanager' | 'backoffice';

export const ROLE_DISPLAY_NAME: Record<SidebarRole, string> = {
  superadmin: 'Superadmin',
  marketing: 'Marketing',
  branchmanager: 'Branch Manager',
  backoffice: 'Backoffice',
};

export interface MenuItem {
  title: string;
  route: string;
  icon: any;
  roles: SidebarRole[];
}

export interface MenuGroup {
  groupName?: string;
  items: MenuItem[];
}

export const MENU_CONFIG: MenuGroup[] = [
  {
    groupName: 'MAIN DASHBOARD',
    items: [
      { title: 'Overview', route: '/admin/overview', icon: LucideLayoutGrid, roles: ['superadmin'] },
      // Dashboard staff (marketing/branchmanager/backoffice) dihapus 2 Sept 2026 —
      // digabung jadi stat strip di atas Review Pinjaman, bukan halaman terpisah lagi.
    ],
  },
  {
    groupName: 'PENGAJUAN & APPROVAL',
    items: [
      { title: 'List Request Pinjaman', route: '/admin/pengajuan', icon: LucideClipboardList, roles: ['superadmin'] },
      // Superadmin by design cuma monitoring (lihat PengajuanController — cuma GET + cancel-admin
      // override), gak ada approve/reject/disburse. Filter status ada di halaman itu sendiri.
      { title: 'Review Pinjaman', route: '/marketing/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['marketing'] },
      { title: 'Review Pinjaman', route: '/branchmanager/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['branchmanager'] },
      { title: 'Review Pinjaman', route: '/backoffice/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['backoffice'] },
      { title: 'Riwayat Review Saya', route: '/marketing/riwayat-review', icon: LucideHistory, roles: ['marketing'] },
      { title: 'Riwayat Review Saya', route: '/branchmanager/riwayat-review', icon: LucideHistory, roles: ['branchmanager'] },
      { title: 'Riwayat Review Saya', route: '/backoffice/riwayat-review', icon: LucideHistory, roles: ['backoffice'] },
    ],
  },
  {
    groupName: 'MASTER DATA',
    items: [
      { title: 'Master Role', route: '/admin/roles', icon: LucideUsers, roles: ['superadmin'] },
      { title: 'Master Staff', route: '/admin/staff', icon: LucideUsers, roles: ['superadmin'] },
      { title: 'Master Menu', route: '/admin/master-menu', icon: LucideLayers, roles: ['superadmin'] },
      { title: 'Master Access', route: '/admin/master-access', icon: LucideShieldCheck, roles: ['superadmin'] },
      { title: 'Master Plafond', route: '/admin/master-plafond', icon: LucideWallet, roles: ['superadmin'] },
      { title: 'Master Rate', route: '/admin/master-rate', icon: LucidePercent, roles: ['superadmin'] },
    ],
  },
];