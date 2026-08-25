import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { 
  LucideAngularModule, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Layers,
  Clock, 
  Percent, 
  HandCoins, 
  UserPlus, 
  FileText, 
  SearchCheck, 
  WalletCards,
  ArrowRight,
} from 'lucide-angular';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.css'
})
export class CustomerHome {
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly TrendingUpIcon = TrendingUp;
  readonly SparklesIcon = Sparkles;
  readonly LayersIcon = Layers;
  readonly ClockIcon = Clock;
  readonly ShieldIcon = ShieldCheck;
  readonly PercentIcon = Percent;
  readonly HandCoinsIcon = HandCoins;

  readonly UserPlusIcon = UserPlus;
  readonly FileTextIcon = FileText;
  readonly SearchCheckIcon = SearchCheck;
  readonly WalletCardsIcon = WalletCards;
  readonly ArrowRightIcon = ArrowRight;

  private router = inject(Router);

  goToLogin() {
    this.router.navigate(['/login']);
  }
}