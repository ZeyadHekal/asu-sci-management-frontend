import { Injectable } from '@angular/core';
import { AuthService as Auth } from '../../api'
import { catchError, firstValueFrom, lastValueFrom, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private authService: Auth) { }
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private privileges: string[] = [];

  private setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return this.refreshToken || localStorage.getItem('refreshToken');
  }

  private setPrivileges(privileges: string[]): void {
    this.privileges = privileges;
    localStorage.setItem('privileges', JSON.stringify(privileges));
  }

  getPrivileges(): string[] {
    return this.privileges.length
      ? this.privileges
      : JSON.parse(localStorage.getItem('privileges') || '[]');
  }

  async login(username: string, password: string): Promise<{ status: boolean, error?: any }> {
    try {
      const response = await firstValueFrom(this.authService.authControllerLogin({ username, password }));
      this.setTokens(response.accessToken, response.refreshToken);
      this.setPrivileges(response.privileges);
      return { status: true };
    } catch (error: any) {
      return { status: false, error: error.error };
    }
  }

  async refreshTokens() {
    const response = await lastValueFrom(this.authService.authControllerRefreshToken({ refreshToken: this.getRefreshToken()! }));
    this.setTokens(response.accessToken, response.refreshToken);
  }

  refreshPrivileges(): Observable<string[]> {
    return this.authService.authControllerRefreshPrivilege().pipe(
      tap((response: any) => {
        this.setPrivileges(response.privileges); // Update privileges in the service
      }),
      catchError((err) => {
        this.logout();
        throw new Error();
      })
    );
  }


  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.privileges = [];
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('privileges');
  }
}
