export interface Role {
  id: string;
  namaRole: string;
  description: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  deletedDate: string | null;
}

// POST/PATCH /api/v1/role (RoleRequest) — field backend "nama", BUKAN "namaRole"
export interface RoleRequest {
  nama: string;
  description: string;
}
