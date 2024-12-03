import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input({ required: true }) courseSelectedId!: number;
  tableHeaders: string[] = ['ID', 'Name', 'Level', 'Email'];
  students: any[] = [];

  // Define a type for students
  allStudents: Record<string, { id: number; name: string; level: string; email: string }[]> = {
    '1': [
      { id: 101, name: 'Alice', level: 'One', email: 'alice@example.com' },
      { id: 102, name: 'Bob', level: 'One', email: 'bob@example.com' },
      { id: 103, name: 'Alice', level: 'One', email: 'alice@example.com' },
      { id: 104, name: 'Bob', level: 'One', email: 'bob@example.com' }
    ],
    '2': [
      { id: 201, name: 'Charlie', level: 'Two', email: 'charlie@example.com' }
    ],
    '3': [
      { id: 301, name: 'Dave', level: 'Three', email: 'dave@example.com' }
    ],
    '4': [
      { id: 401, name: 'Eve', level: 'Four', email: 'eve@example.com' }
    ]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courseSelectedId'] && this.courseSelectedId) {
      this.loadStudents();
    }
  }

  loadStudents(): void {
    // Convert courseSelectedId to a string to access allStudents
    this.students = this.allStudents[this.courseSelectedId.toString()] || [];
    console.log('Loaded students:', this.students);  // For debugging
  }
}
