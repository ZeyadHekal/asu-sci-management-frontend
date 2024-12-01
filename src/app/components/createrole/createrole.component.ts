import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-createrole',
  imports: [ReactiveFormsModule,NgClass,NgFor,NgIf],
  templateUrl: './createrole.component.html',
  styleUrl: './createrole.component.css'
})
export class CreateroleComponent {
  roleForm: FormGroup;
  privileges = [
    { id: 1, name: 'Read' },
    { id: 2, name: 'Write' },
    { id: 3, name: 'Update' },
    { id: 4, name: 'Delete' },
  ];
  selectedPrivileges: number[] = [];
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required]
    });
  }

  togglePrivilege(privilege: { id: number; name: string }): void {
    if (this.selectedPrivileges.includes(privilege.id)) {
      this.selectedPrivileges = this.selectedPrivileges.filter(id => id !== privilege.id);
    } else {
      this.selectedPrivileges.push(privilege.id);
    }
  }

  isSelected(privilege: { id: number; name: string }): boolean {
    return this.selectedPrivileges.includes(privilege.id);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.roleForm.valid && this.selectedPrivileges.length > 0) {
      const roleData = {
        roleName: this.roleForm.value.roleName,
        privileges: this.selectedPrivileges
      };
      console.log('Role Data:', roleData); // Replace with backend submission later
    }
  }
}
