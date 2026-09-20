import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
// `vi` isn't picked up as an ambient global here (this project's ambient types resolve from
// `@types/jasmine`, which `describe`/`it`/`expect` happen to satisfy the shape of, but it has
// no notion of `vi`) — explicit import needed, same as the existing `vitest`-import pattern
// in auth.interceptor.spec.ts.
import { vi } from 'vitest';
import { roleGuard, menuAccessGuard } from './auth.guards';
import { AuthService } from '../services/auth.service';
import { RoleMenuAccess } from '../../shared/models/role-menu.model';

// -----------------------------------------------------------------------------------------
// roleGuard()
//
// Root cause of the original failure: this file used Jasmine syntax (`jasmine.createSpyObj`,
// `.and.returnValue`) which doesn't exist under the Vitest runner (`ReferenceError: jasmine
// is not defined`) — but converting the syntax alone wasn't enough to make it pass. The old
// test also asserted behavior the guard doesn't have anymore: it mocked `AuthService
// .isLoggedIn()` and expected `router.parseUrl('/login')` to be called on failure. Looking at
// `auth.guards.ts`, `roleGuard()` never touches `AuthService` at all (that check is dead,
// commented-out code inside the guard) — it reads `localStorage['userRole']` directly and
// calls `router.navigate(['/login'])`, returning a plain `boolean` (never a `UrlTree`).
// Rewritten in Vitest syntax against what the guard actually does today.
// -----------------------------------------------------------------------------------------
describe('roleGuard (Unit Test)', () => {
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('harus mengizinkan akses (return true) kalau userRole di localStorage ada di allowedRoles', () => {
    localStorage.setItem('userRole', 'superadmin');

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['superadmin', 'marketing'])({} as any, {} as any)
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('harus menolak akses (return false) dan navigate ke /login kalau userRole gak termasuk allowedRoles', () => {
    localStorage.setItem('userRole', 'marketing');

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['superadmin'])({} as any, {} as any)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('harus menolak akses (return false) dan navigate ke /login kalau belum ada userRole sama sekali', () => {
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['superadmin'])({} as any, {} as any)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});

// -----------------------------------------------------------------------------------------
// menuAccessGuard()
//
// New coverage — this guard previously had zero tests despite being the security-relevant
// enforcement layer for Master Access (tbl_role_menu): it's what stops a staff member from
// reaching a page directly by URL after their `canView` was unchecked (see CLAUDE.md
// "Sinkronisasi Master Access ke route guard", 3 Sept 2026). It returns an Observable<boolean
// | UrlTree> sourced from `AuthService.ensureMenuAccessLoaded()`.
// -----------------------------------------------------------------------------------------
describe('menuAccessGuard (Unit Test)', () => {
  let authServiceSpy: { ensureMenuAccessLoaded: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };

  const buildAccessRow = (path: string, canView: boolean): RoleMenuAccess => ({
    id: 'row-1',
    role: {
      id: 'role-1',
      namaRole: 'MARKETING',
      description: null,
      createdDate: null,
      updatedDate: null,
      deletedDate: null,
    },
    menu: {
      id: 'menu-1',
      namaMenu: 'Review Pinjaman',
      path,
      icon: null,
      parentId: null,
      urutan: 1,
      status: 'ACTIVE',
      createdAt: null,
    },
    canView,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    createdAt: null,
  });

  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      menuAccessGuard()({} as any, { url } as any)
    ) as Observable<boolean | UrlTree>;

  beforeEach(() => {
    authServiceSpy = { ensureMenuAccessLoaded: vi.fn() };
    routerSpy = { createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('fail-open (true) kalau myMenuAccess masih kosong (belum sempat fetch / network error)', async () => {
    authServiceSpy.ensureMenuAccessLoaded.mockReturnValue(of([]));

    const result = await firstValueFrom(runGuard('/admin/pengajuan'));

    expect(result).toBe(true);
  });

  it('mengizinkan akses (true) kalau ada row match state.url dengan canView=true', async () => {
    authServiceSpy.ensureMenuAccessLoaded.mockReturnValue(
      of([buildAccessRow('/admin/pengajuan', true)])
    );

    const result = await firstValueFrom(runGuard('/admin/pengajuan'));

    expect(result).toBe(true);
  });

  it('menolak akses (redirect UrlTree ke /) kalau row match path tapi canView=false', async () => {
    const dummyTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(dummyTree);
    authServiceSpy.ensureMenuAccessLoaded.mockReturnValue(
      of([buildAccessRow('/admin/pengajuan', false)])
    );

    const result = await firstValueFrom(runGuard('/admin/pengajuan'));

    expect(result).toBe(dummyTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('menolak akses (redirect UrlTree ke /) kalau ada data tapi gak ada row buat path ini sama sekali', async () => {
    const dummyTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(dummyTree);
    // Data ada (fetch berhasil), tapi cuma buat menu lain — path yang lagi diakses gak
    // pernah ke-daftar di tbl_role_menu buat role ini sama sekali.
    authServiceSpy.ensureMenuAccessLoaded.mockReturnValue(
      of([buildAccessRow('/admin/staff', true)])
    );

    const result = await firstValueFrom(runGuard('/admin/pengajuan'));

    expect(result).toBe(dummyTree);
  });
});
