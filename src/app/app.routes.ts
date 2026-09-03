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
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent)
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
      },
      {
        path: 'staff',
        loadComponent: () => import('./pages/superadmin/staff/staff').then(m => m.StaffComponent)
      },
      {
        path: 'master-menu',
        loadComponent: () => import('./pages/superadmin/master-menu/master-menu').then(m => m.MasterMenu)
      },
      {
        path: 'master-access',
        loadComponent: () => import('./pages/superadmin/master-access/master-access').then(m => m.MasterAccess)
      }
    ]
  },

  // Rute Marketing
  {
    path: 'marketing',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['marketing'])],
    children: [
      { path: '', redirectTo: 'review-pinjaman', pathMatch: 'full' },
      { 
        path: 'plafond', 
        loadComponent: () => import('./pages/marketing/plafond/plafond').then(m => m.Plafond) 
      },
      {
        path: 'review-pinjaman',
        loadComponent: () => import('./pages/marketing/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman)
      },
      {
        path: 'riwayat-review',
        loadComponent: () => import('./pages/staff/riwayat-review/riwayat-review').then(m => m.RiwayatReview)
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
        loadComponent: () => import('./pages/branchmanager/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman)
      },
      {
        path: 'riwayat-review',
        loadComponent: () => import('./pages/staff/riwayat-review/riwayat-review').then(m => m.RiwayatReview)
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
        loadComponent: () => import('./pages/backoffice/review-pinjaman/review-pinjaman').then(m => m.ReviewPinjaman)
      },
      {
        path: 'riwayat-review',
        loadComponent: () => import('./pages/staff/riwayat-review/riwayat-review').then(m => m.RiwayatReview)
      }
    ]
  },

  // Settings — bisa diakses staff role manapun (nama/email sendiri, bukan Master Data)
  {
    path: 'settings',
    component: DashboardLayoutComponent,
    canActivate: [roleGuard(['superadmin', 'marketing', 'branchmanager', 'backoffice'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsComponent)
      }
    ]
  },

  // Wildcard Fallback
  { path: '**', redirectTo: '' }
];
