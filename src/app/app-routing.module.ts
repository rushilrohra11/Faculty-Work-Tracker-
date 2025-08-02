import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TasksComponent } from './teacher/tasks/tasks.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddSubjectComponent } from './profile-settings/add-subject/add-subject.component';
import { AddTeacherComponent } from './profile-settings/add-teacher/add-teacher.component';
import { TeacherLoginComponent } from './auth/teacher-login/teacher-login.component'; 

const routes: Routes = [
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
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksComponent },
  { path: '**', redirectTo: '/tasks' }
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
