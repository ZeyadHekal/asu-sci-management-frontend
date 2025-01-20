import { Component, OnInit } from '@angular/core';
import { PrivilegeAssignmentDto, PrivilegeCode, PrivilegeDto, PrivilegeService, UserTypeService, UserTypeWithPrivilegeDto } from '../../api';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { PrivilegeSelectorPopupComponent } from '../../privilege-selector-popup/privilege-selector-popup.component';

@Component({
  selector: 'app-user-type-management',
  templateUrl: './user-type-management.component.html',
  styleUrls: ['./user-type-management.component.scss'],
  imports: [FormsModule, NgFor, NgIf, NavComponent, PrivilegeSelectorPopupComponent]
})
export class UserTypeManagementComponent implements OnInit {
  userTypes: UserTypeWithPrivilegeDto[] = [];
  filteredUserTypes: UserTypeWithPrivilegeDto[] = [];
  searchTerm: string = '';
  editingStates: { [key: string]: { isEditing: boolean; editName: string } } = {};
  showPopup = false;
  selectedUserType: any;
  filteredPrivileges = [] as PrivilegeDto[];
  allPrivileges = [] as PrivilegeDto[];

  constructor(private userTypeService: UserTypeService, private privilegeService: PrivilegeService) { }

  ngOnInit(): void {
    this.fetchUserTypes();
    this.fetchPrivileges();

  }

  fetchUserTypes() {
    this.userTypeService.userTypeControllerFindAllWithPrivileges().subscribe((data) => {
      this.userTypes = data;
      this.filteredUserTypes = data;
      this.filteredUserTypes.forEach((userType) => {
        this.editingStates[userType.id] = { isEditing: false, editName: '' };
      });
    });
  }

  fetchPrivileges() {
    this.privilegeService.privilegeControllerGetAllPrivileges().subscribe((data) => {
      this.allPrivileges = data;
    });
  }

  filterUserTypes() {
    this.filteredUserTypes = this.userTypes.filter((type) =>
      type.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  unassignPrivilege(userTypeId: string, privilegeCode: PrivilegeCode) {
    this.privilegeService.privilegeControllerUnassignPrivilegeToUserType({ userTypeId, privilegeCode })
      .subscribe(() => {
        this.fetchUserTypes();
      });
  }

  managePrivilegeResources(privilege: PrivilegeAssignmentDto) {
    // Implement a popup or modal to manage resources
    console.log('Managing resources for:', privilege);
  }

  addPrivilegeToUserType(userType: any) {
    this.selectedUserType = userType;
    this.filteredPrivileges = this.allPrivileges.filter(
      (privilege) =>
        !userType.privileges.some((p: any) => p.code === privilege.code)
    );
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  assignPrivileges(selectedPrivileges: string[], userType: any) {
    // Add the selected privileges to the userType
    const newPrivileges = this.allPrivileges.filter((privilege) =>
      selectedPrivileges.includes(privilege.code)
    );

    userType.privileges = [...userType.privileges, ...newPrivileges];
    this.showPopup = false;

    for (const priv of newPrivileges) {
      this.privilegeService.privilegeControllerAssignPrivilegeToUserType({ userTypeId: userType.id, privilegeCode: priv.code as PrivilegeCode }).subscribe();
    }
    console.log('Updated user type:', userType);
  }

  openAddUserTypePopup() {
    // Implement functionality to open add user type popup
    console.log('Opening add user type popup');
  }

  isEditing(userTypeId: string): boolean {
    return this.editingStates[userTypeId]?.isEditing || false;
  }

  startEditing(userTypeId: string, currentName: string) {
    this.editingStates[userTypeId].isEditing = true;
    this.editingStates[userTypeId].editName = currentName;
  }

  saveUserType(userTypeId: string) {
    const newName = this.editingStates[userTypeId].editName;

    // Save the updated name locally
    const userType = this.filteredUserTypes.find((ut) => ut.id === userTypeId);
    if (userType) {
      userType.name = newName;
    }

    // Call the API and subscribe to the response
    this.userTypeService.userTypeControllerUpdate(userTypeId, { name: newName }).subscribe({
      next: (response) => {
        console.log(`User type updated successfully:`, response);
        // Exit editing mode
        this.editingStates[userTypeId].isEditing = false;
      },
      error: (err) => {
        console.error('Error updating user type:', err);
        // Handle error (e.g., show an error message to the user)
      },
    });
  }


  cancelEditing(userTypeId: string) {
    // Exit editing mode without saving changes
    this.editingStates[userTypeId].isEditing = false;
  }

}
