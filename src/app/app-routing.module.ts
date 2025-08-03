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
import { ResearchAssistantComponent } from './research-assistant/research-assistant.component';
import { SettingsComponent } from './profile-settings/settings/settings.component';
import { LoginAsComponent } from './auth/login-as/login-as.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  // Default route - redirect to tasks
  
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
    path: 'home',
    component: HomeComponent
  },
  {
   path: 'settings',
   component:  SettingsComponent
  },
  {
    path: 'teacher-weekly-summary',
    component: TeacherWeeklySummaryComponent
  },
  {
    path: 'loginAs',
    component: LoginAsComponent
  },
  { path: 'tasks', component: TasksComponent },
  {
    path: 'research-assistant',
    component: ResearchAssistantComponent
  },
  
  // Authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'teacher-login', component: TeacherLoginComponent },
  
  // Profile settings routes
  { path: 'addSubject', component: AddSubjectComponent },
  { path: 'addTeacher', component: AddTeacherComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Wildcard route - must be last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }