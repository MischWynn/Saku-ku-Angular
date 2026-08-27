import { Routes } from '@angular/router';
import {LoginComponent} from '../app/pages/auth/login/login';
import { DashboardLayoutComponent } from '../app/layout/dashboard-layout/dashboard-layout';
import { roleGuard } from '../app/core/guards/auth.guards';
import { CustomerLayout } from '../app/layout/customer-layout/customer-layout';

export const routes: Routes = [
    {
        path: '',
        // component: CustomerLayout,
        loadComponent: () =>
            import('../app/layout/customer-navbar/customer-navbar').then(
                (m) => m.CustomerNavbar
            ),
            children: [
                {
                    path: '',
                    loadComponent: () =>
                        import('../app/layout/customer-home/customer-home').then(
                            (m) => m.CustomerHome
                        )
                }
            ]
    },
// Halaman Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login').then((m) => m.LoginComponent)
  },

  // Rute Superadmin
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['superadmin'])],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { 
        path: 'overview', 
        loadComponent: () => import('./pages/superadmin/overview/overview').then(m => m.Overview) 
      },
      { 
        path: 'pengajuan', 
        loadComponent: () => import('./pages/superadmin/pengajuan/pengajuan').then(m => m.Pengajuan) 
      },
      { 
        path: 'approval', 
        loadComponent: () => import('./pages/superadmin/approval/approval').then(m => m.Approval) 
      },
      { 
        path: 'roles', 
        loadComponent: () => import('./pages/superadmin/roles/roles').then(m => m.Roles) 
      }
    ]
  },

  // Rute Marketing
  {
    path: 'marketing',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['marketing'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/marketing/dashboard/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'plafond', 
        loadComponent: () => import('./pages/marketing/plafond/plafond').then(m => m.Plafond) 
      },
      { 
        path: 'review-pinjaman', 
        loadComponent: () => import('./pages/marketing/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman) 
      }
    ]
  },

  // Rute Branch Manager
  {
    path: 'branchmanager',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['branchmanager'])],
    children: [
      { path: '', redirectTo: 'review-pinjaman', pathMatch: 'full' },
      { 
        path: 'review-pinjaman', 
        loadComponent: () => import('./pages/marketing/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman) 
      }
    ]
  },

  // Rute Backoffice
  {
    path: 'backoffice',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['backoffice'])],
    children: [
      { path: '', redirectTo: 'review-pinjaman', pathMatch: 'full' },
      { 
        path: 'review-pinjaman', 
        loadComponent: () => import('./pages/marketing/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman) 
      }
    ]
  },

  // Wildcard Fallback
  { path: '**', redirectTo: '' }
];
