import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [NgFor,RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(private authService: AuthService, private router: Router) {}
  res = [
    {
      addStudent: true,
      doctor: true,
      admin: true,
      assistant:true,
      labs:true,
      student:true,

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
