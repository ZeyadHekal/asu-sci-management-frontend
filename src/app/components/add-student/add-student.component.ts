import { Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-add-student',
  imports: [NavComponent, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css',
})
export class AddStudentComponent {
  addStudentForm: FormGroup;
  courses: string[] = ['Comp104', 'Comp103', 'Comp101', 'Comp133', 'Comp312'];
  selectedCourses: string[] = [];

  constructor() {
    this.addStudentForm = new FormGroup(
      {
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  onCourseSelection(course: string, event: any) {
    if (event.target.checked) {
      this.selectedCourses.push(course);
    } else {
      this.selectedCourses = this.selectedCourses.filter((c) => c !== course);
    }
  }

  onSubmitStudentForm() {
    if (this.addStudentForm.valid) {
      const formData = {
        username: this.addStudentForm.value.username,
        password: this.addStudentForm.value.password,
        courses: this.selectedCourses,
      };
      console.log('New Student:', formData);
    }
  }

  private passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}
