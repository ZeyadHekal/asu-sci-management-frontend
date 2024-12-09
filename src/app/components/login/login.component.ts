import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../api/api/auth.service';

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
    setTimeout(() => {
      this.isloading = false;
    }, 3000);
  }

  constructor(private authService: AuthService,private router: Router) {}
  login(username: string, password: string) {
    const loginRequestDto = {
      username,
      password,
    };

    this.authService.authControllerLogin(loginRequestDto, 'body').subscribe({
      next: (response) => {
        // نجاح تسجيل الدخول
        console.log('Login Successful:', response);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      },
      error: (error) => {
        // فشل تسجيل الدخول
        this.router.navigate(['/landing']);
        console.error('Login Failed:', error);
      },
    });
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
