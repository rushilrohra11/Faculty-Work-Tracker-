import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddSubjectComponent } from './profile-settings/add-subject/add-subject.component';
import { AddTeacherComponent } from './profile-settings/add-teacher/add-teacher.component';

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
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
