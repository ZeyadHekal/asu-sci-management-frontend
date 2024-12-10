import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { DevicesComponent } from "./components/devices/devices.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DevicesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ASU Science Management';
}
