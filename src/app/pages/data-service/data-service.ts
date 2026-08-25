import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Model } from '../../core/interface/model/model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'https://dummyjson.com/recipes';

  getAllRecipes(): Observable<Model[]> {
    return this.http.get<{ recipes: Model[] }>(this.apiUrl).pipe(
      map(response => response.recipes)
    );
  }

  getRecipeById(id: number): Observable<Model> {
    return this.http.get<Model>(`${this.apiUrl}/${id}`);
  }
}