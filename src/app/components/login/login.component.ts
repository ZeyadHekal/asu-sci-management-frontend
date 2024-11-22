import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup , FormControl ,ReactiveFormsModule , Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm=new FormGroup({
    email:new FormControl('',[
      Validators.required,
      Validators.pattern('^[0-9]{14}@sci\.asu\.edu\.eg$')
    ]),
    password:new FormControl('',[
      Validators.required
    ])
  });

  isloading:boolean=true;
  ngOnInit(): void {
    setTimeout(() => {
      this.isloading = false;
    }, 3000);
  }
}
