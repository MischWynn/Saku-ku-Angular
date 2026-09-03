export type StaffRole = 'SUPERADMIN' | 'MARKETING' | 'BM' | 'BACK_OFFICE';
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface StaffRoleInfo {
  id: string;
  namaRole: StaffRole;
  description: string;
}

export interface Staff {
  id: string;
  namaLengkap: string;
  username: string;
  email: string;
  role: StaffRoleInfo;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
  deletedDate: string | null;
}

// POST /api/v1/user (RegisterRequest)
export interface CreateStaffRequest {
  namaLengkap: string;
  username: string;
  password: string;
  email: string;
  roleName: StaffRole;
}

// PATCH /api/v1/user/{id} (UpdateUserRequest) — semua field opsional, null/undefined = gak diubah
export interface UpdateStaffRequest {
  namaLengkap?: string;
  email?: string;
  status?: StaffStatus;
  roleName?: StaffRole;
}
