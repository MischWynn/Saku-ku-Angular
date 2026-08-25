import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// import { LucideAngularModule, Me } from 'lucide-angular';

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [ RouterOutlet],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.css',
})
export class CustomerNavbar {

  // isMobileMenuOpen = signal(false);

  // toggleMobileMenu() {
  //   this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  // }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Di Mobile: scroll ke paling atas elemen dikurangi tinggi navbar
      const yOffset = -90; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Di Desktop/Tablet: letakkan tepat di tengah layar
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

}
