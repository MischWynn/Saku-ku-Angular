import { Menu } from './menu.model';
import { Role } from './role.model';

// GET /api/v1/role-menu/role/{roleId} — 1 baris per menu yang UDAH PERNAH disave buat role ini.
// Menu yang belum pernah di-save gak akan punya baris sama sekali (bukan berarti semua false).
export interface RoleMenuAccess {
  id: string;
  role: Role;
  menu: Menu;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string | null;
}

// PUT /api/v1/role-menu — body-nya array dari ini (bulk save semua checkbox 1 role sekaligus)
export interface RoleMenuRequest {
  roleId: string;
  menuId: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
