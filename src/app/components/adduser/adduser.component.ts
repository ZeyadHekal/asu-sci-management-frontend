import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { PrivilegeDto, UserService, UserTypeDto, UserTypeService } from '../../api';

@Component({
  selector: 'app-adduser',
  imports: [ReactiveFormsModule, NgIf, NgFor,NgClass, FormsModule, NavComponent],
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css'],
})
export class AdduserComponent implements OnInit {
  roles: UserTypeDto[] = [];
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
  allPrivileges = [] as PrivilegeDto[];

  constructor(private fb: FormBuilder, private userTypeService: UserTypeService, private userService: UserService) {
    this.addUserForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required], 
    });
  }

  ngOnInit() {
    this.fetchUserTypes();
  }

  fetchUserTypes() {
    this.userTypeService.userTypeControllerFindAll().subscribe((data) => {
      console.log(data);
      this.roles = data;
    });
  }
  @ViewChild('roleSelect') roleSelect!: ElementRef<HTMLSelectElement>;
  onRoleChange() {
    // this.selectedRole = this.addUserForm.get('role')!.value; 
    this.selectedRole = this.roleSelect.nativeElement.options[this.roleSelect.nativeElement.selectedIndex].text;; 
    console.log(this.selectedRole);
    if (this.selectedRole == 'Student') {
      console.log('Student role selected, show courses');
    }
  }

  onSubmitUserForm() {
    if (this.addUserForm.invalid) {
      alert('Please fill out the form correctly');
      return;
    }
    this.userService.userControllerCreate({
      name: this.addUserForm.get('username')!.value,
      username: this.addUserForm.get('username')!.value,
      password: this.addUserForm.get('password')!.value,
      userTypeId: this.addUserForm.get('role')!.value
    }).subscribe()
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
