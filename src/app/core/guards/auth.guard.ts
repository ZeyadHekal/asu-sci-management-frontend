import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is logged in, checking role.');

      const userRole = this.authService.getUserRole();

      const targetRoute = this.getTargetRouteForRole(userRole);

      if (state.url === targetRoute) {
        return true;
      }

      console.log(`AuthGuard: Navigating to ${targetRoute}`);
      this.router.navigate([targetRoute]);
      return false;
    } else {
      console.log('AuthGuard: User is not logged in, redirecting to /login.');
      this.router.navigate(['/login']);
      return false;
    }
  }

  private getTargetRouteForRole(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'student':
        return '/student';
      default:
        return '/login'; // Default route if the role is unknown
    }
  }
}
