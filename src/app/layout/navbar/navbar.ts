import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  LucideSettings,
  LucideBell,
  LucideChevronRight,
  LucideUser
} from '@lucide/angular';

export interface UserProfile {
  name: string;
  roleTitle: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideSettings, LucideBell, LucideChevronRight, LucideUser],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {

  currentPath = signal<string>('');

  // Info Staff Profile (bisa diambil dari AuthService/State)
  userProfile = signal<UserProfile>({
    name: 'Jane Doe',
    roleTitle: 'Marketing Officer',
    avatarUrl: ''
  });

  hasNotification = signal<boolean>(true);

  // Breadcrumbs Generator Dinamis
  breadcrumb = computed(() => {
    const path = this.currentPath();
    if (path.includes('/marketing')) {
      return { section: 'Marketing Dashboard', page: 'Overview' };
    } else if (path.includes('/branchmanager')) {
      return { section: 'Branch Manager', page: 'Review Pinjaman' };
    } else if (path.includes('/backoffice')) {
      return { section: 'Backoffice', page: 'Review Pinjaman' };
    }
    return { section: 'Superadmin', page: 'Overview' };
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentPath.set(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath.set(event.urlAfterRedirects);
      });
  }
}