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
  // selectedCourseId!: number;
  selectedCourseId!: number;
  data!:any[];
  tableHeader :string[]=['ID', 'Name', 'Level', 'Email',"Device","Active"];
  sidebarCon = [
    { id: 1, name: 'Comp104' },
    { id: 2, name: 'Comp102' },
    { id: 3, name: 'Comp301' },
    { id: 4, name: 'Comp302' }
  ];

  // A single source of truth for data
  allData = [
    { id: 101, name: 'Alice', level: 'one', email: 'alice@example.com', active: true, courseId: 1 },
    { id: 102, name: 'Bob', level: 'one', email: 'bob@example.com', active: true, courseId: 1 },
    { id: 103, name: 'Alice', level: 'two', email: 'alice@example.com', active: true, courseId: 1 },
    { id: 104, name: 'Bob', level: 'two', email: 'bob@example.com', active: false, courseId: 1 },
    { id: 122, name: 'Alice', level: 'one', email: 'alice@example.com', active: false, courseId: 1 },
    { id: 234, name: 'Bob', level: 'one', email: 'bob@example.com', active: false, courseId: 1 },
    { id: 101, name: 'Alice', level: 'one', email: 'alice@example.com', active: true, courseId: 2 },
    { id: 122, name: 'Alice', level: 'one', email: 'alice@example.com', active: false, courseId: 2 },
    { id: 234, name: 'Bob', level: 'one', email: 'bob@example.com', active: false, courseId: 2 },
    { id: 234, name: 'Bob', level: 'one', email: 'bob@example.com', active: false, courseId: 3 },
    { id: 101, name: 'Alice', level: 'one', email: 'alice@example.com', active: true, courseId: 4 },
    { id: 102, name: 'Bob', level: 'one', email: 'bob@example.com', active: true, courseId: 4 },
    { id: 103, name: 'Alice', level: 'two', email: 'alice@example.com', active: true, courseId: 4 },
    { id: 104, name: 'Bob', level: 'two', email: 'bob@example.com', active: false, courseId: 4 },
    { id: 122, name: 'Alice', level: 'one', email: 'alice@example.com', active: false, courseId: 4 },
    { id: 234, name: 'Bob', level: 'one', email: 'bob@example.com', active: false, courseId: 4 },
  ];

  onSelect(courseId: number=1): void {
    this.selectedCourseId = courseId;
    this.data = this.allData.filter(student => student.courseId === courseId);
    console.log(`Filtered Data for Course ${courseId}:`, this.data);
  }
  
}
