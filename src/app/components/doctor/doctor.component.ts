import { Component} from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { TableComponent } from "../table/table.component";
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-doctor',
  imports: [NavComponent, TableComponent , SidebarComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {  
  selectedCourseId!: number | null;
  onCourseSelect(courseId: number): void {
    this.selectedCourseId = courseId;
    console.log(`Selected Course ID: ${courseId}`);
  }
}
