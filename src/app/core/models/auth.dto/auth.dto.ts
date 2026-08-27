import { Component } from '@angular/core';

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  role: string;
  email: string;
}