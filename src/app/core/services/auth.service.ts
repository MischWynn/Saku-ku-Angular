import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequestDTO, AuthResponseDTO } from '../models/auth.dto/auth.dto';
import { apicall } from '../../../util/apicall';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = `${environment.apiUrl}/user`;
  private readonly tokenKey = 'auth_token';

  login(payload: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.api.post<AuthResponseDTO>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}

// export class AuthService {
//   private http = inject(HttpClient);
//   private apiUrl = `${environment.apiUrl}/users`;

//      login(payload: { email: string; password: string }): Observable<any> {
//     return this.http.post<any>(`${this.apiUrl}/login`, payload, {
//       withCredentials: true 
//     });
//   }
  // login(payload: { email: string; password: string }): any {
  //   return apicall.call(this, 'POST', `${this.apiUrl}/login`, {}, payload);
  // }
// }

//   private tokenKey = 'auth_token';

//   login(payload: LoginRequestDTO): Observable<AuthResponseDTO> {
//     return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, payload).pipe(
//       tap(res => {
//         if (res.token) {
//           localStorage.setItem(this.tokenKey, res.token);
//         }
//       })
//     );
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.tokenKey);
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }

//   logout(): void {
//     localStorage.removeItem(this.tokenKey);
//   }
// }