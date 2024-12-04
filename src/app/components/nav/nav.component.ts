import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [NgFor],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(private authService: AuthService, private router: Router) {}
  res = [
    {
      accounts: true,
      lab: true,
      students: true
    }
  ];
  toggle=true;
  getTrueKeys(obj: any): string[] {
    return Object.keys(obj).filter(key => obj[key] === true);
  }
  logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    console.log("signedOut")
    this.router.navigate(['/login']);
  }

}
