import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-adduser',
  imports: [ReactiveFormsModule, NgIf, NgFor,NgClass, FormsModule, NavComponent],
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css'],
})
export class AdduserComponent {
  roles = [
    { id: '1', name: 'Admin' },
    { id: '2', name: 'Doctor' },
    { id: '3', name: 'Assistant' },
    { id: '4', name: 'Student' },
  ];
  levels = [
    {
      level: 1,
      courses: [
        { id: 'course1', name: 'Course 1' },
        { id: 'course2', name: 'Course 2' },
      ],
    },
    {
      level: 2,
      courses: [
        { id: 'course3', name: 'Course 3' },
        { id: 'course4', name: 'Course 4' },
      ],
    },
  ];
  selectedRole!: string;
  selectedCourses: string[] = [];
  addUserForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required], 
    });
  }

  onRoleChange() {
    this.selectedRole = this.addUserForm.get('role')!.value; 
    console.log(this.selectedRole);
    if (this.selectedRole === '4') {
      console.log('Student role selected, show courses');
    }
  }

  onSubmitUserForm() {
    if (this.addUserForm.invalid) {
      alert('Please fill out the form correctly');
      return;
    }
    alert('User created successfully');
  }

  onCourseSelection(courseId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedCourses.push(courseId);
    } else {
      this.selectedCourses = this.selectedCourses.filter((id) => id !== courseId);
    }
  }

  onSubmitCourses() {
    alert(`Courses submitted: ${this.selectedCourses.join(', ')}`);
  }
}
