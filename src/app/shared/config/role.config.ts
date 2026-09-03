/**
 * Sumber kebenaran tunggal untuk role naming.
 * BusinessRole = persis nilai dari backend (tbl_role.nama_role, JWT claim 'role', GET /user/me).
 * SidebarRole  = dipakai untuk routing/folder pages/{role}/... dan filter sidebar (lowercase,
 *                'branchmanager' bukan 'BM' — karena folder & route sudah terlanjur pakai ini).
 */

export type BusinessRole = 'SUPERADMIN' | 'MARKETING' | 'BM' | 'BACK_OFFICE';
export type SidebarRole = 'superadmin' | 'marketing' | 'branchmanager' | 'backoffice';

export const BUSINESS_TO_SIDEBAR_ROLE: Record<BusinessRole, SidebarRole> = {
  SUPERADMIN: 'superadmin',
  MARKETING: 'marketing',
  BM: 'branchmanager',
  BACK_OFFICE: 'backoffice',
};

export const ROLE_DISPLAY_NAME: Record<BusinessRole, string> = {
  SUPERADMIN: 'Superadmin',
  MARKETING: 'Marketing',
  BM: 'Branch Manager',
  BACK_OFFICE: 'Backoffice',
};

export function toSidebarRole(businessRole: string): SidebarRole {
  return BUSINESS_TO_SIDEBAR_ROLE[businessRole as BusinessRole] ?? 'marketing';
}