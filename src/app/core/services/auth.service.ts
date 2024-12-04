import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null; 
  private staticLoginResponse = {
    accessToken: 'static-access-token-12345',
    refreshToken: 'static-refresh-token-12345',
    user: {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com'
    }
  };

  constructor() {}

  login(credentials: { email: string; password: string }): Observable<any> {
    if (credentials.email === 'johndoe@example.com' && credentials.password === 'password123') {
      return of(this.staticLoginResponse).pipe(
        tap((response: any) => {
          this.token = response.accessToken;
        })
      );
    } else {
      return of(null);
    }
  }

  
  isLoggedIn(): boolean {
    return this.token !== null;
    // return false
  }

  getUserRole(): string {
    return "doctor";
  }

  logout(): void {
    this.token = null;
  }
  getToken(): string | null {
    return this.token;
  }
}
