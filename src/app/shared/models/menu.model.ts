export type MenuStatus = 'ACTIVE' | 'INACTIVE';

export interface Menu {
  id: string;
  namaMenu: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  urutan: number | null;
  status: MenuStatus;
  createdAt: string | null;
}

// POST/PATCH /api/v1/menu (MenuRequest) — semua field opsional di update (partial), backend
// isi status='ACTIVE' otomatis pas create kalau gak dikirim.
export interface MenuRequest {
  namaMenu?: string;
  path?: string;
  icon?: string;
  parentId?: string | null;
  urutan?: number;
  status?: MenuStatus;
}
