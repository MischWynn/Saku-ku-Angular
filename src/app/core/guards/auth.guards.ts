import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    // const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('userRole');
    // const menuKey = route.data["menuKey"] as MenuKey | undefined;

    // if (!auth.isAuthenticated()) {
    //   return router.createUrlTree(['/login']);
    // }

    // return menuKey && auth.canAccessMenu(menuKey) ? true : router.createUrlTree(['/forbidden']);
    
    // const userRole = localStorage.getItem('userRole') || 'superadmin';

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

//     if (allowedRoles.includes(userRole)) {
//       return true;
//     }

//     router.navigate(['/login']);
//     return false;


    router.navigate(['/login']);
    return false;
  };
};

/**
 * Enforce per-menu `canView` dari Master Access (tbl_role_menu), di atas roleGuard yang
 * cuma cek role. Dipasang di route parent per grup role (admin/marketing/branchmanager/
 * backoffice) — `state.url` di CanActivateFn selalu path tujuan akhir navigasi, jadi
 * cukup 1x per grup, gak perlu dipasang di tiap child route satu-satu.
 *
 * Fail-open kalau `myMenuAccess` masih kosong (belum sempat fetch, atau network error) —
 * sengaja gak nge-block akses cuma karena data belum ada, sama filosofinya kayak fallback
 * sidebar (lihat sidebar.ts `filteredMenuGroups`). roleGuard() tetap jadi lapisan utama;
 * guard ini cuma nutup celah "role benar tapi 1 menu spesifik di-uncheck via Master Access".
 */
export const menuAccessGuard = (): CanActivateFn => {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.ensureMenuAccessLoaded().pipe(
      map((access) => {
        if (access.length === 0) return true;
        const canView = access.some((row) => row.menu.path === state.url && row.canView);
        return canView ? true : router.createUrlTree(['/']);
      })
    );
  };
};
