import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TasksComponent } from './teacher/tasks/tasks.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddSubjectComponent } from './profile-settings/add-subject/add-subject.component';
import { AddTeacherComponent } from './profile-settings/add-teacher/add-teacher.component';
import { TeacherLoginComponent } from './auth/teacher-login/teacher-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherWeeklySummaryComponent } from './teacher-weekly-summary/teacher-weekly-summary.component';

const routes: Routes = [
  // Default route - redirect to tasks
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Main application routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'addSubject',
    component: AddSubjectComponent
  },
  {
    path: 'addTeacher',
    component: AddTeacherComponent
  },
  {
    path: 'teacher-login',
    component: TeacherLoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'teacher-weekly-summary',
    component: TeacherWeeklySummaryComponent
  },
  { path: 'tasks', component: TasksComponent },
  
  // Authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'teacher-login', component: TeacherLoginComponent },
  
  // Profile settings routes
  { path: 'addSubject', component: AddSubjectComponent },
  { path: 'addTeacher', component: AddTeacherComponent },
  
  // Wildcard route - must be last
  { path: '**', redirectTo: '/tasks' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }