import { Component } from '@angular/core';
import { LoginComponent } from "./components/login/login.component";
import { AdduserComponent } from './components/adduser/adduser.component';
import { LandingComponent } from "./components/landing/landing.component";
import { ManagementComponent } from './components/management/management.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, AdduserComponent, LandingComponent,ManagementComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ASU Science Management';
}
