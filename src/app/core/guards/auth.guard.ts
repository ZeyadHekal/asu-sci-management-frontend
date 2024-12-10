import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PrivilegeGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPrivileges = route.data['privileges'] as string[];
    const userPrivileges = this.authService.getPrivileges();

    if (requiredPrivileges.every((priv) => userPrivileges.includes(priv))) {
      return true;
    }

    // this.router.navigate(['/landing']);
    return true;
  }
}
