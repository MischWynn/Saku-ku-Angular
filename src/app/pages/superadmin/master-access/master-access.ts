import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { LucideSave } from '@lucide/angular';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { Role } from '../../../shared/models/role.model';
import { Menu } from '../../../shared/models/menu.model';
import { RoleMenuAccess, RoleMenuRequest } from '../../../shared/models/role-menu.model';

interface AccessRow {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-master-access',
  standalone: true,
  imports: [CommonModule, LucideSave],
  templateUrl: './master-access.html',
  styleUrl: './master-access.css',
})
export class MasterAccess {
  private readonly http = inject(HttpClient);
  private readonly roleApiUrl = `${environment.apiUrl}/role`;
  private readonly menuApiUrl = `${environment.apiUrl}/menu`;
  private readonly roleMenuApiUrl = `${environment.apiUrl}/role-menu`;

  protected readonly selectedRoleId = signal<string | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saveSuccess = signal(false);

  protected readonly rolesResource = httpResource<ApiResponse<Role[]>>(() => this.roleApiUrl);
  protected readonly roleList = computed(() => (this.rolesResource.value()?.data ?? []).filter((r) => !r.deletedDate));

  protected readonly menusResource = httpResource<ApiResponse<Menu[]>>(() => this.menuApiUrl);
  protected readonly menuList = computed(() =>
    [...(this.menusResource.value()?.data ?? [])].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  );

  protected readonly accessResource = httpResource<ApiResponse<RoleMenuAccess[]>>(() => {
    const roleId = this.selectedRoleId();
    return roleId ? `${this.roleMenuApiUrl}/role/${roleId}` : undefined;
  });

  protected readonly isLoading = computed(
    () => this.rolesResource.isLoading() || this.menusResource.isLoading() || this.accessResource.isLoading()
  );

  protected readonly matrix = signal<Record<string, AccessRow>>({});

  constructor() {
    effect(() => {
      const rows = this.accessResource.value()?.data ?? [];
      const map: Record<string, AccessRow> = {};
      for (const row of rows) {
        map[row.menu.id] = {
          view: row.canView,
          create: row.canCreate,
          update: row.canUpdate,
          delete: row.canDelete,
        };
      }
      this.matrix.set(map);
      this.saveSuccess.set(false);
      this.saveError.set(null);
    });
  }

  protected onRoleChange(roleId: string): void {
    this.selectedRoleId.set(roleId || null);
  }

  protected rowFor(menuId: string): AccessRow {
    return this.matrix()[menuId] ?? { view: false, create: false, update: false, delete: false };
  }

  protected toggle(menuId: string, field: keyof AccessRow): void {
    const current = this.rowFor(menuId);
    this.matrix.update((m) => ({ ...m, [menuId]: { ...current, [field]: !current[field] } }));
  }

  protected onSave(): void {
    const roleId = this.selectedRoleId();
    if (!roleId) return;

    const payload: RoleMenuRequest[] = this.menuList().map((menu) => {
      const row = this.rowFor(menu.id);
      return {
        roleId,
        menuId: menu.id,
        canView: row.view,
        canCreate: row.create,
        canUpdate: row.update,
        canDelete: row.delete,
      };
    });

    this.isSaving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.http.put<ApiResponse<unknown>>(this.roleMenuApiUrl, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Gagal menyimpan akses. Silakan coba lagi.');
      },
    });
  }
}
