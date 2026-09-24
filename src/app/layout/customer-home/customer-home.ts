import { Component, ElementRef, DestroyRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
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
    LucideUserPlus,
    LucideFileText,
    LucideSearchCheck,
    LucideWalletCards,
    LoanSimulationComponent
  ],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.css'
})
export class CustomerHome implements AfterViewInit {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  // Fade+slide-up tiap `.reveal` sekali pas dia pertama kali masuk viewport, lalu unobserve
  // (gak replay pas scroll naik-turun berulang). Skip total kalau user prefer reduced motion —
  // CSS-nya juga cuma nge-hide `.reveal` di dalam media query yang sama, jadi kalau branch ini
  // gak jalan, elemen tetap keliatan normal (gak ada elemen numpuk hidden tanpa observer).
  //
  // Dipasang di `ngAfterViewInit`, BUKAN `afterNextRender()` — sengaja, ketauan pas testing:
  // `afterNextRender` nunggu browser confirm satu PAINT CYCLE beneran kelar dulu (rAF-driven),
  // dan di tab yang lagi backgrounded/gak difokus user, Chrome suspend rAF-driven callback TOTAL
  // sampai tab itu di-foreground lagi — observer.observe() jadi ketunda tanpa batas waktu jelas.
  // `ngAfterViewInit` murni sinyal internal Angular ("view sendiri udah selesai di-render ke
  // DOM"), gak nunggu compositor/paint apapun, jadi tetap jalan normal walau tab lagi gak aktif.
  //
  // Safety-net fallback: kalau IntersectionObserver gak pernah fire buat alasan apapun (browser
  // quirk, extension yang stub API-nya, dll), paksa semua `.reveal` tetep muncul abis beberapa
  // detik. Mending kehilangan efek scroll-reveal-nya daripada konten ilang permanen dari user.
  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }

  private setupScrollReveal(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const revealEls = Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
    if (!revealEls.length) return;

    const reveal = (el: HTMLElement) => el.classList.add('is-visible');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    const fallback = setTimeout(() => {
      revealEls.forEach(reveal);
      observer.disconnect();
    }, 2500);

    this.destroyRef.onDestroy(() => {
      clearTimeout(fallback);
      observer.disconnect();
    });
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