// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const token = localStorage.getItem('auth_token');

//   // Jangan sertakan token pada endpoint publik / login
//   if (token && !req.url.includes('/login')) {
//     const clonedReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return next(clonedReq);
//   }

//   return next(req);
// };


// ini kalau mau pakai cookies: 
// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   // Gandakan setiap request dengan menyertakan credentials (cookies)
//   const reqWithCredentials = req.clone({
//     withCredentials: true
//   });

//   return next(reqWithCredentials);
// };

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Endpoint publik (permitAll di backend) - JANGAN nempelin token basi ke sini. Backend nolak
// request yang punya header Authorization invalid/expired SEBELUM sempat ngecek body-nya sama
// sekali, walau endpoint-nya permitAll() (JwtAuthFilter jalan duluan sebelum controller manapun
// kesentuh). Sama persis bug yang ditemuin & difix di AuthInterceptor.kt Android, 15 Sept.
const PUBLIC_ENDPOINT_SUFFIXES = ['/user/login', '/user/forgot-password', '/user/reset-password'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  const isPublicEndpoint = PUBLIC_ENDPOINT_SUFFIXES.some((suffix) => req.url.includes(suffix));

  if (!token || isPublicEndpoint) {
    return next(req);
  }

  const reqWithAuth = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(reqWithAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token yang nempel ditolak backend (expired/basi) - bersihin sesi lokal + paksa balik ke
      // Login, ke mana pun staff lagi berada. Tanpa ini, request gagal diam-diam dan staff
      // nyangkut di halaman yang lagi dibuka, gak ngerti kenapa datanya gak muncul/gagal-gagal
      // terus. Beda dari Android (yang punya mode guest, logout manual balik ke Beranda tamu) -
      // dashboard staff ini gak punya guest mode sama sekali, jadi sesi habis SELALU ke /login.
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userRole');
        router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};