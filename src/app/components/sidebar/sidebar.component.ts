import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [NgFor,NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output () courseSelected=new EventEmitter<number>();
  selectedCourseId: number | null = null;
  courses = [
    { id: 1, name: 'Comp104' },
    { id: 2, name: 'Comp102' },
    { id: 3, name: 'Comp301' },
    { id: 4, name: 'Comp302' }
  ];

  selectCourse(id:number){
    
    this.selectedCourseId = id;
    console.log(`Course Selected id= ${id}`);
    this.courseSelected.emit(id);
  }
  

}
