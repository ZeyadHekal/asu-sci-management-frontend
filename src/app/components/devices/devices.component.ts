import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { TableComponent } from "../table/table.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-devices',
  imports: [NavComponent,SidebarComponent,NgClass,NgIf, NgFor],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent {
  tableHeader:any=["Device id" ,"Device name", "Divice specfication", "Working/sus" , "Reports number", "Device Program"];
  data:any[]=[];
  sidebarCon = [
    { id: 1, name: 'lab1' },
    { id: 2, name: 'lab2' },
    { id: 3, name: 'lab3' },
    { id: 4, name: 'lab4' }
  ];
  labId:number=1
  allData:any[]=[
    {deviceId:"2a2" ,name:"D1" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45 ,lab:1,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"2a2" ,name:"D2" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:1, prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"3fd" ,name:"D3" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:1,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"23f" ,name:"D4" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:2,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"d3f" ,name:"D1" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45 ,lab:3,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"2a2" ,name:"D2" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:3,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"3df" ,name:"D3" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:4,prog:"VScode , visual studio code , clion MySQL"},
    {deviceId:"2af" ,name:"D4" ,spe:"Intel celeron, 1GB ,100GB" ,working:true,num:45,lab:4,prog:"VScode , visual studio code , clion MySQL"}

  ];

  onSelect(labId: number): void {
    this.labId = labId;
    this.data = this.allData.filter(device => device.lab === labId);
    console.log(`Filtered Data for Course ${labId}:`, this.data);
  }
}
