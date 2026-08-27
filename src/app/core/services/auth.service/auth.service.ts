import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequestDTO, AuthResponseDTO } from '../../models/auth.dto/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/user';

     login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, payload, {
      withCredentials: true 
    });
  }
}

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