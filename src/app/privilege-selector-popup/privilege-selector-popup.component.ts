import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PrivilegeAssignmentDto } from '../api';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-privilege-selector-popup',
  templateUrl: './privilege-selector-popup.component.html',
  styleUrls: ['./privilege-selector-popup.component.scss'],
  imports: [NgFor, FormsModule]
})
export class PrivilegeSelectorPopupComponent {
  @Input() availablePrivileges: PrivilegeAssignmentDto[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() privilegesSelected = new EventEmitter<string[]>();
  extendedPrivileges: Array<
    PrivilegeAssignmentDto & { selected: boolean }
  > = [];
  ngOnInit(): void {
    // Extend each privilege with a `selected` property
    this.extendedPrivileges = this.availablePrivileges.map((privilege) => ({
      ...privilege,
      selected: false,
    }));
  }

  closePopup() {
    this.close.emit();
  }

  saveSelection() {
    // Emit the selected privilege codes
    const selectedPrivileges = this.extendedPrivileges
      .filter((privilege) => privilege.selected)
      .map((privilege) => privilege.code);

    this.privilegesSelected.emit(selectedPrivileges);
  }
}
