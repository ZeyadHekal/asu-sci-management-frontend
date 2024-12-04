import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup , FormControl ,ReactiveFormsModule , Validators} from '@angular/forms';
import { Router} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  isloading = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isloading = false;
    }, 3000);
  }

  login(userName:string,password:string) {
    const credentials = { email: userName, password: password };
    this.auth.login(credentials).subscribe(
      (response) => {
        if (response) {
          console.log('Login successful:', response);
          this.router.navigate(['/landing']);
        } else {
          console.error('Login failed');
        }
      },
      (error) => {
        console.error('Login error:', error);
      }
    );
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.login('johndoe@example.com','password123');
    }
  }
  
}
