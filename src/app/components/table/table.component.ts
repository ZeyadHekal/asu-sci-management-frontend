import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgFor, NgIf,NgClass],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input() courseSelectedId!: number;
  @Input () tableHeader!:string[];
  @Input () data!:any[];
  

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['courseSelectedId'] && this.courseSelectedId) {
    //   this.loadStudents();
    // }
  }

  loadStudents(): void {
    this.data = this.data[this.courseSelectedId] ;
    // console.log('Loaded students:', this.data);  
  }
}
