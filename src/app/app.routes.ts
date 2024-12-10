import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { ManagementComponent } from './components/management/management.component';
import { AdduserComponent } from './components/adduser/adduser.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { AssistantComponent } from './components/assistant/assistant.component';
import { StudentComponent } from './components/student/student.component';
import { DevicesComponent } from './components/devices/devices.component';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'login',component:LoginComponent},
    {path:'addStudent',component:AddStudentComponent},
    {path:'landing',component:LandingComponent,},
    {path:'doctor',component:DoctorComponent},
    {path:'admin',component:ManagementComponent},
    {path:'addUser',component:AdduserComponent},
    {path:'student',component:StudentComponent},
    {path:'assistant',component:AssistantComponent},
    {path:'labs',component:DevicesComponent},
    {path:'**',component:LoginComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
