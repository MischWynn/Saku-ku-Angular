import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { NavbarComponent } from '../navbar/navbar';
import { LucideAngularModule, Menu } from 'lucide-angular';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LucideAngularModule, NavbarComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent {
  isSidebarOpen = signal(false);
  readonly MenuIcon = Menu;

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}