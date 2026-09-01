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

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return next(req);
  }

  const reqWithAuth = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(reqWithAuth);
};