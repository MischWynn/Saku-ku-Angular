import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  LucideArrowUpRight,
  LucideShieldCheck,
  LucideClock,
  LucidePercent,
  LucideHandCoins,
  LucideUserPlus,
  LucideFileText,
  LucideSearchCheck,
  LucideWalletCards,
} from '@lucide/angular';
import { LoanSimulationComponent } from '../simulation-calculator/simulation-calculator';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideArrowUpRight,
    LucideShieldCheck,
    LucideClock,
    LucidePercent,
    LucideHandCoins,
    LucideUserPlus,
    LucideFileText,
    LucideSearchCheck,
    LucideWalletCards,
    LoanSimulationComponent
  ],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.css'
})
export class CustomerHome {

  private router = inject(Router);

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}