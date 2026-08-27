import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

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
