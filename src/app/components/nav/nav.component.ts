import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NAV_ITEMS } from './nav.config';

@Component({
  selector: 'app-nav',
  imports: [NgFor, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(private authService: AuthService, private router: Router) { }

  getNavbarItems(): { label: string; path: string }[] {
    const userPrivileges = this.authService.getPrivileges(); // Fetch user privileges
    return NAV_ITEMS.filter(
      (item) =>
        item.isEnabled &&
        (!item.privilege || userPrivileges.includes(item.privilege))
    ).map((item) => ({ label: item.label, path: item.path }));
  }

  logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    console.log("signedOut")
    this.router.navigate(['/login']);
  }

}
