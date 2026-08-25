import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../app/pages/data-service/data-service';
import { Model } from '../../core/interface/model/model';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe.html',
  styleUrl: './recipe.css'
})
export class Recipe implements OnInit {
  private dataService = inject(DataService);

  recipe$ = signal<Model | null>(null);
  recipes$ = signal<Model[]>([]);
  selectedRecipeId = signal<number | null>(null);

  ngOnInit(): void {
    this.dataService.getRecipeById(1).subscribe({
      next: (response) => {
        this.recipe$.set(response);
      },
      error: (err) => {
        console.error('Error fetching recipe:', err);
      }
    });

    this.dataService.getAllRecipes().subscribe({
      next: (response) => {
        this.recipes$.set(response);
      },
      error: (err) => {
        console.error('Error fetching all recipes:', err);
      }
    });
  }
  toggleDetail(id: number): void {
    if (this.selectedRecipeId() === id) {
      this.selectedRecipeId.set(null);
    } else {
      this.selectedRecipeId.set(id);
    }
  }
}