import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() Selected = new EventEmitter<number>();
  @Input ({required:true}) data!:any;
  selectedCourseId: number = 1;

  selectCourse(id: number): void {
    this.selectedCourseId = id;
    console.log(`Course Selected id= ${id}`);
    this.Selected.emit(id);
  }
}
