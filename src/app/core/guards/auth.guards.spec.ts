import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from '../guards/auth.guards';
import { AuthService } from '../../core/services/auth.service';

describe('RoleGuard (Unit Test)', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl', 'navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  // 1. Positive Test Case
  it('harus mengizinkan akses (return true) jika user sudah terautentikasi', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => roleGuard({} as any));

    expect(result).toBeTrue();
  });

  // 2. Negative Test Case
  it('harus menolak akses dan redirect ke /login jika user belum login', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const dummyTree = {} as any;
    routerSpy.parseUrl.and.returnValue(dummyTree);

    const result = TestBed.runInInjectionContext(() => roleGuard({} as any));

    expect(result).toBe(dummyTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
  });
});