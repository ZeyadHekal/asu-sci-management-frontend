import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { CreateroleComponent } from "../createrole/createrole.component";
import { EditroleComponent } from "../editrole/editrole.component";
import { NgClass, NgIf } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-management',
  imports: [NavComponent, CreateroleComponent, EditroleComponent,NgClass,NgIf],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
  animations: [
    trigger('fadeAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),     
      transition('void <=> *', animate('500ms ease-in-out')),
    ])
  ]
})
export class ManagementComponent {
  activeTab: string = 'create'; 

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
