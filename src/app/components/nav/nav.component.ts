import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  imports: [NgFor,NgIf],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  res = [
    {
      accounts: true,
      lab: true,
      students: true
    },
    {
      labs:["Comp104","Comp203","Comp303"]
    }
  ];
  toggle=true;
  getTrueKeys(obj: any): string[] {
    return Object.keys(obj).filter(key => obj[key] === true);
  }

}
