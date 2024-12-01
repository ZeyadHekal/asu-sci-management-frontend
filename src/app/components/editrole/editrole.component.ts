import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-editrole',
  imports: [NgClass,NgIf,NgFor],
  templateUrl: './editrole.component.html',
  styleUrl: './editrole.component.css',
})
export class EditroleComponent  {
  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Assistant' },
    { id: 3, name: 'Student' }
  ];

  // Mock privileges data (simulating fetched data)
  allPrivileges = [
    { id: 1, name: 'Create Users' },
    { id: 2, name: 'Edit Users' },
    { id: 3, name: 'Delete Users' },
    { id: 4, name: 'View Reports' },
  ];

  selectedRole: any = null; // Stores selected role
  selectedPrivileges: Set<number> = new Set(); // Track selected privileges

  
  selectRole(role: any): void {
    this.selectedRole = role;
    this.selectedPrivileges.clear(); 
    console.log(`Selected role: ${role.name}`);
    
    this.allPrivileges.forEach(priv => {
      if (priv.id % 2 === 0) {
        this.selectedPrivileges.add(priv.id);
      }
    });
  }

  // Handle privilege toggle
  togglePrivilege(privilegeId: number): void {
    if (this.selectedPrivileges.has(privilegeId)) {
      this.selectedPrivileges.delete(privilegeId);
    } else {
      this.selectedPrivileges.add(privilegeId);
    }
    console.log('Updated Privileges:', Array.from(this.selectedPrivileges));
  }

  // Submit the updated privileges (currently prints to console)
  submitPrivileges(): void {
    console.log('Submitting Privileges:', Array.from(this.selectedPrivileges));
  }
}
