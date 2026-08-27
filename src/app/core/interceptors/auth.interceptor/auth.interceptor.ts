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

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Gandakan setiap request dengan menyertakan credentials (cookies)
  const reqWithCredentials = req.clone({
    withCredentials: true
  });

  return next(reqWithCredentials);
};