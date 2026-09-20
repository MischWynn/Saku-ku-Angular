import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { LoginRequestDTO, AuthResponseDTO, ForgotPasswordRequest, ResetPasswordRequest } from '../models/auth.dto/auth.dto';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api-response';
import { toSidebarRole } from '../../shared/config/role.config';
import { RoleMenuAccess } from '../../shared/models/role-menu.model';

export interface UserProfileResponse {
  namaLengkap: string;
  roleName: string; // nilai mentah dari backend, mis. 'MARKETING' / 'BM' / 'SUPERADMIN'
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = `${environment.apiUrl}/user`;
  private readonly tokenKey = 'auth_token';

  readonly currentUser = signal<UserProfileResponse | null>(null);
  // Akses menu (Master Access) buat role user yang lagi login — sumber data sidebar dinamis.
  readonly myMenuAccess = signal<RoleMenuAccess[]>([]);
  private hasFetchedMenuAccess = false;

  login(payload: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.api.post<AuthResponseDTO>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  fetchCurrentUser(): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.get<ApiResponse<UserProfileResponse>>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        this.currentUser.set(res.data ?? null);
        if (res.data?.roleName) {
          // simpen versi 'sidebar-friendly' (lowercase, 'branchmanager') buat sidebar filtering
          localStorage.setItem('userRole', toSidebarRole(res.data.roleName));
        }
      })
    );
  }

  fetchMyMenuAccess(): Observable<ApiResponse<RoleMenuAccess[]>> {
    return this.api.get<ApiResponse<RoleMenuAccess[]>>(`${environment.apiUrl}/role-menu/me`).pipe(
      tap((res) => {
        this.myMenuAccess.set(res.data ?? []);
        this.hasFetchedMenuAccess = true;
      })
    );
  }

  // Dipakai menuAccessGuard() — nunggu fetch selesai kalau belum pernah (mis. hard refresh
  // langsung ke deep link), tapi gak nge-fetch ulang tiap navigasi kalau udah ada di cache.
  ensureMenuAccessLoaded(): Observable<RoleMenuAccess[]> {
    if (this.hasFetchedMenuAccess) {
      return of(this.myMenuAccess());
    }
    return this.fetchMyMenuAccess().pipe(map((res) => res.data ?? []));
  }

  updateOwnProfile(payload: { namaLengkap?: string; email?: string }): Observable<ApiResponse<unknown>> {
    return this.api.patch<ApiResponse<unknown>>(`${this.apiUrl}/me`, payload);
  }

  changePassword(payload: { oldPassword: string; newPassword: string }): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`${this.apiUrl}/change-password`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ApiResponse<string>> {
    return this.api.post<ApiResponse<string>>(`${this.apiUrl}/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.api.post<ApiResponse<null>>(`${this.apiUrl}/reset-password`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Server-side logout ditambahin 19 Sept - sebelumnya token cuma di-clear LOKAL, JWT-nya
  // sendiri masih valid di backend sampai TTL alami habis (lihat TokenBlacklistService,
  // backend). Fire-and-forget: gak nunggu response-nya sebelum clear state lokal + redirect,
  // biar logout tetap kerasa instan dan gak ke-block kalau network lagi bermasalah.
  logout(): void {
    this.api.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userRole');
    this.currentUser.set(null);
    this.myMenuAccess.set([]);
    this.hasFetchedMenuAccess = false;
  }
}