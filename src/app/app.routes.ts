import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout';
import { roleGuard } from './guards/auth.guards';
import { CustomerLayout } from './core/layout/customer-layout/customer-layout';

export const routes: Routes = [
    {
        path: '',
        // component: CustomerLayout,
        loadComponent: () =>
            import('./core/layout/customer-navbar/customer-navbar').then(
                (m) => m.CustomerNavbar
            ),
            children: [
                {
                    path: '',
                    loadComponent: () =>
                        import('./core/layout/customer-home/customer-home').then(
                            (m) => m.CustomerHome
                        )
                }
            ]
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login').then((m) => m.LoginComponent)
    }, 
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
    //   { 
    //     path: 'plafond', 
    //     loadComponent: () => import('./pages/superadmin/plafond/plafond').then(m => m.PlafondComponent) 
    //   },
      { 
        path: 'pengajuan', 
        loadComponent: () => import('./pages/superadmin/pengajuan/pengajuan').then(m => m.Pengajuan) 
      },
    //   { 
    //     path: 'review-antrian', 
    //     loadComponent: () => import('./pages/superadmin/review-antrian/review-antrian').then(m => m.ReviewAntrianComponent) 
    //   },
      { 
        path: 'approval', 
        loadComponent: () => import('./pages/superadmin/approval/approval').then(m => m.Approval) 
      },
      { 
        path: 'roles', 
        loadComponent: () => import('./pages/superadmin/roles/roles').then(m => m.Roles) 
      },
    //   { 
    //     path: 'master-data', 
    //     loadComponent: () => import('./pages/superadmin/master-data/master-data').then(m => m.MasterDataComponent) 
    //   },
    //   { 
    //     path: 'audit-log', 
    //     loadComponent: () => import('./pages/superadmin/audit-log/audit-log').then(m => m.AuditLogComponent) 
    //   }
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

  {
    path: 'recipes',
    loadComponent: () => 
      import('./pages/recipe/recipe').then((m) => m.Recipe),
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./pages/recipe/recipe').then((m) => m.Recipe)
  },

  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
