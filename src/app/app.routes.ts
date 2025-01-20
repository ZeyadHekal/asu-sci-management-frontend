import { Route, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { AdduserComponent } from './components/adduser/adduser.component';
import { AssistantComponent } from './components/assistant/assistant.component';
import { DevicesComponent } from './components/devices/devices.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { ManagementComponent } from './components/management/management.component';
import { StudentComponent } from './components/student/student.component';
import { NAV_ITEMS, NavItem } from './components/nav/nav.config';
import { PrivilegeGuard } from './core/guards/auth.guard';
import { UserTypeManagementComponent } from './components/user-type-management/user-type-management.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: LandingComponent },
  ...NAV_ITEMS.map((item: NavItem): Route => ({
    path: item.path,
    component: resolveComponent(item.path), // Adjust to resolve the correct component
    data: item.privilege ? { privileges: [item.privilege] } : undefined,
    canActivate: [PrivilegeGuard]
  })),
  { path: '**', redirectTo: 'login' }, // Fallback route
];

// Helper to resolve components based on paths
function resolveComponent(path: string) {
  switch (path) {
    case 'login': return LoginComponent;
    case 'addStudent': return AddStudentComponent;
    case 'landing': return LandingComponent;
    case 'doctor': return DoctorComponent;
    case 'admin': return UserTypeManagementComponent;
    case 'addUser': return AdduserComponent;
    case 'student': return StudentComponent;
    case 'assistant': return AssistantComponent;
    case 'labs': return DevicesComponent;
    default: return LoginComponent;
  }
}


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
