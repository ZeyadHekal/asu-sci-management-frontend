import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { ManagementComponent } from './components/management/management.component';
import { AdduserComponent } from './components/adduser/adduser.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { AddStudentComponent } from './components/add-student/add-student.component';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'login',component:LoginComponent},
    {path:'addStudent',component:AddStudentComponent},
    {path:'landing',component:LandingComponent,canActivate:[AuthGuard]},
    {path:'doctor',component:DoctorComponent,canActivate:[AuthGuard]},
    {path:'admin',component:ManagementComponent,canActivate:[AuthGuard]},
    {path:'addUser',component:AdduserComponent,canActivate:[AuthGuard]},
    {path:'**',component:LoginComponent}

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})

export class AppRoutingModule {}