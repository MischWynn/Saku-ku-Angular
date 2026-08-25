import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const userRole = localStorage.getItem('userRole') || 'superadmin';

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  };
};