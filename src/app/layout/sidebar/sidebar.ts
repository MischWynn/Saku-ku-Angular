import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideLayoutGrid,
  LucideClipboardList,
  LucideMessageSquareDiff,
  LucideUsers,
  LucideLogOut,
  LucideLayers
} from '@lucide/angular';

export type UserRole = 'superadmin' | 'marketing' | 'branchmanager' | 'backoffice';

export interface MenuItem {
  title: string;
  route: string;
  icon: any;
  roles: UserRole[];
}

export interface MenuGroup {
  groupName?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideDynamicIcon, LucideLogOut],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  // Current user role state (change to 'marketing' to preview marketing sidebar)
  currentUserRole = signal<UserRole>(
    (localStorage.getItem('userRole') as UserRole) || 'marketing'
  );

  readonly LogOutIcon = LucideLogOut;
  readonly LayersIcon = LucideLayers;

  // Master Menu Configuration
  private readonly menuConfig: MenuGroup[] = [
    {
      groupName: 'MAIN DASHBOARD',
      items: [
        { title: 'Overview', route: '/admin/overview', icon: LucideLayoutGrid, roles: ['superadmin'] },
        { title: 'Dashboard', route: '/marketing/dashboard', icon: LucideLayoutGrid, roles: ['marketing'] },
        // { title: 'Plafond Saya', route: '/admin/plafond', icon: Wallet, roles: ['superadmin'] },
        // { title: 'Plafond', route: '/marketing/plafond', icon: Wallet, roles: ['marketing'] }
      ]
    },
    {
      groupName: 'PENGAJUAN & APPROVAL',
      items: [
        { title: 'Semua Pengajuan', route: '/admin/pengajuan', icon: LucideClipboardList, roles: ['superadmin'] },
        { title: 'Review Antrian', route: '/admin/review-antrian', icon: LucideMessageSquareDiff, roles: ['superadmin'] },
        { title: 'Review Pinjaman', route: '/marketing/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['marketing'] },
        { title: 'Review Pinjaman', route: '/branchmanager/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['branchmanager'] },
        { title: 'Review Pinjaman', route: '/backoffice/review-pinjaman', icon: LucideMessageSquareDiff, roles: ['backoffice'] },
        // { title: 'Approval Panel', route: '/admin/approval', icon: CheckCircle2, roles: ['superadmin'] }
      ]
    },
    {
      groupName: 'SYSTEM MANAGEMENT',
      items: [
        { title: 'RBAC (Roles)', route: '/admin/roles', icon: LucideUsers, roles: ['superadmin'] },
        // { title: 'Master Data', route: '/admin/master-data', icon: Database, roles: ['superadmin'] },
        // { title: 'Audit Log', route: '/admin/audit-log', icon: BarChart3, roles: ['superadmin'] }
      ]
    }
      
  ];

  filteredMenuGroups = computed(() => {
    const role = this.currentUserRole();
    return this.menuConfig
      .map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(role))
      }))
      .filter(group => group.items.length > 0);
  });

  // ngOnInit(): void {
  // const currentUrl = window.location.pathname;
  //   if (currentUrl.includes('/admin')) {
  //     this.currentUserRole.set('superadmin');
  //   } else if (currentUrl.includes('/marketing')) {
  //     this.currentUserRole.set('marketing');
  //   } else if (currentUrl.includes('/branchmanager')) {
  //     this.currentUserRole.set('branchmanager');
  //   } else if (currentUrl.includes('/backoffice')) {
  //     this.currentUserRole.set('backoffice');
  //   }
  // }

  ngOnInit(): void {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      this.currentUserRole.set(storedRole);
    }
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}
 