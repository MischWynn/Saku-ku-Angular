
import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideSettings, LucideBell, LucideChevronRight, LucideUser } from '@lucide/angular';
import { MENU_CONFIG } from '../../shared/config/sidebar-menu.config';
import { ROLE_DISPLAY_NAME, BusinessRole } from '../../shared/config/role.config';
import { AuthService } from '../../core/services/auth.service';

// export interface UserProfile {
//   name: string;
//   roleTitle: string;
// }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideSettings, LucideBell, LucideChevronRight, LucideUser],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class NavbarComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentPath = signal<string>('');
  
  userProfile = computed(() => {
    const user = this.authService.currentUser();
    return {
      name: user?.namaLengkap ?? '...',
      roleTitle: user?.roleName ? ROLE_DISPLAY_NAME[user.roleName as BusinessRole] : '',
    };
  });

  hasNotification = signal<boolean>(true); // TODO: connect ke GET /api/v1/review-log/me

    breadcrumb = computed(() => {
    const path = this.currentPath();
    const businessRole = this.authService.currentUser()?.roleName;
    const section = businessRole ? ROLE_DISPLAY_NAME[businessRole as BusinessRole] : '...';

    const allItems = MENU_CONFIG.flatMap(g => g.items);
    const matched = allItems
      .filter(item => path.startsWith(item.route))
      .sort((a, b) => b.route.length - a.route.length)[0];

    return { section, page: matched?.title ?? 'Overview' };
  });

  // breadcrumb = computed(() => {
  //   const path = this.currentPath();
  //   const role = (localStorage.getItem('userRole') as SidebarRole) || 'marketing';
  //   const section = ROLE_DISPLAY_NAME[role];

  //   const allItems = MENU_CONFIG.flatMap(g => g.items);
  //   const matched = allItems
  //     .filter(item => path.startsWith(item.route))
  //     .sort((a, b) => b.route.length - a.route.length)[0]; // match paling spesifik

  //   return { section, page: matched?.title ?? 'Overview' };
  // });

  // constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentPath.set(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath.set(event.urlAfterRedirects);
      });
  }
}


// import {
//   LucideSettings,
//   LucideBell,
//   LucideChevronRight,
//   LucideUser
// } from '@lucide/angular';

  // currentPath = signal<string>('');
  // // TODO: masih placeholder — perlu AuthService expose nama+role user login (lihat auth.dto.ts)
  // userProfile = signal<UserProfile>({
  //   name: 'Jane Doe',
  //   roleTitle: 'Marketing Officer',
  // });

// export class NavbarComponent implements OnInit {

//   currentPath = signal<string>('');

//   // Info Staff Profile (bisa diambil dari AuthService/State)
//   userProfile = signal<UserProfile>({
//     name: 'Jane Doe',
//     roleTitle: 'Marketing Officer',
//     avatarUrl: ''
//   });

//   hasNotification = signal<boolean>(true);

//   // Breadcrumbs Generator Dinamis
//   breadcrumb = computed(() => {
//     const path = this.currentPath();
//     if (path.includes('/marketing')) {
//       return { section: 'Marketing Dashboard', page: 'Overview' };
//     } else if (path.includes('/branchmanager')) {
//       return { section: 'Branch Manager', page: 'Review Pinjaman' };
//     } else if (path.includes('/backoffice')) {
//       return { section: 'Backoffice', page: 'Review Pinjaman' };
//     }
//     return { section: 'Superadmin', page: 'Overview' };
//   });

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     this.currentPath.set(this.router.url);
//     this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd))
//       .subscribe((event: any) => {
//         this.currentPath.set(event.urlAfterRedirects);
//       });
//   }
// }