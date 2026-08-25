import { Component } from '@angular/core';

// @Component({
//   selector: 'app-model',
//   imports: [],
//   templateUrl: './model.html',
//   styleUrl: './model.css',
// })

export interface Model {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string;
}

export interface Users {
  id : number;
  firstName : string;
  lastName : string;
  maidenName : string;
  age: number;
  email: string;
}