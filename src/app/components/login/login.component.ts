import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  isloading = false;
  ngOnInit(): void {
    if (this.authService.getAccessToken()) {
      this.router.navigate(['/landing'])
    }
    setTimeout(() => {
      this.isloading = false;
    }, 3000);
  }

  constructor(private authService: AuthService,private router: Router) {}
  async login(username: string, password: string) {
    const { status, error } = await this.authService.login(username, password);
    if (status) {
      console.log('Login Successful');
      this.router.navigate(['/landing']);
    } else {
      console.error(error);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.login(
        this.loginForm.get("username")!.value!,
        this.loginForm.get('password')!.value!
      );
    }
  }
}
