import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add authorization header when token exists', () => {
    localStorage.setItem('auth_token', 'test-token');

    http.get('/api/protected').subscribe();

    const req = httpMock.expectOne('/api/protected');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ ok: true });
  });

  it('should not add authorization header when token is missing', () => {
    localStorage.removeItem('auth_token');

    http.get('/api/protected').subscribe();

    const req = httpMock.expectOne('/api/protected');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ ok: true });
  })

  it('should not attach a stale token to public auth endpoints (login/forgot/reset-password)', () => {
    localStorage.setItem('auth_token', 'stale-token');

    http.post('/api/v1/user/login', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/user/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ ok: true });
  });

  it('should clear the session and redirect to /login on a 401 from a protected endpoint', async () => {
    localStorage.setItem('auth_token', 'expired-token');
    localStorage.setItem('userRole', 'marketing');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    let caught: unknown;
    http.get('/api/protected').subscribe({ error: (err) => { caught = err; } });

    const req = httpMock.expectOne('/api/protected');
    req.flush({ message: 'Token tidak valid' }, { status: 401, statusText: 'Unauthorized' });

    // catchError->throwError still needs a microtask to reach the subscriber's error callback -
    // flushing that here so `caught` (and the spy call recorded just before it) are settled
    // before asserting, instead of racing the assertions against it.
    await Promise.resolve();

    expect(caught).toBeDefined();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { sessionExpired: 'true' } });
  });

  afterEach(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userRole');
  });

});
