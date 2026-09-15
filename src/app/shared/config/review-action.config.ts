import { UserRole } from '../models/loan-application';

export interface ReviewActionConfig {
  type: 'APPROVE' | 'REJECT';
  label: string;
  style: 'primary' | 'danger';
}

export interface RoleActionConfig {
  title: string;
  notesLabel: string;
  notesPlaceholder: string;
  actions: ReviewActionConfig[];
}

export const ROLE_REVIEW_CONFIG: Record<UserRole, RoleActionConfig> = {
  MARKETING: {
    title: 'Review Pinjaman (Marketing)',
    notesLabel: 'Marketing Notes (Optional)',
    notesPlaceholder: 'Tambahkan catatan untuk Branch Manager...',
    actions: [
      { type: 'REJECT', label: 'Tolak', style: 'danger' },
      { type: 'APPROVE', label: 'Setujui & Lanjut ke BM', style: 'primary' },
    ],
  },
  BM: {
    title: 'Approval Final Pinjaman',
    notesLabel: 'Catatan Persetujuan BM',
    notesPlaceholder: 'Catatan keputusan persetujuan limit...',
    actions: [
      { type: 'REJECT', label: 'Tolak Pinjaman', style: 'danger' },
      { type: 'APPROVE', label: 'Approve & Lanjut ke Back Office', style: 'primary' },
    ],
  },
  BACK_OFFICE: {
    title: 'Pencairan Pinjaman',
    notesLabel: 'Catatan Pencairan',
    notesPlaceholder: 'Tambahkan catatan pencairan...',
    actions: [
      { type: 'APPROVE', label: 'Cairkan Dana', style: 'primary' },
      // Backend belum punya endpoint reject untuk Back Office.
      // Tinggal uncomment baris ini kalau nanti ditambahkan:
      // { type: 'REJECT', label: 'Batalkan', style: 'danger' },
    ],
  },
  // Superadmin cuma monitoring — gak ada approve/reject/disburse (lihat PengajuanController,
  // satu-satunya action khusus superadmin itu cancel-admin, bukan review flow ini).
  // `actions: []` bikin drawer otomatis sembunyiin tombol aksi + textarea catatan.
  SUPERADMIN: {
    title: 'Detail Pengajuan',
    notesLabel: '',
    notesPlaceholder: '',
    actions: [],
  },
};