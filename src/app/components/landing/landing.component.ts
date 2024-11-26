import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";

@Component({
  selector: 'app-landing',
  imports: [NgIf, NgFor, NavComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  

}
