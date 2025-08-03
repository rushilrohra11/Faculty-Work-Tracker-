import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TeacherModule } from './teacher/teacher.module';
import { AuthModule } from './auth/auth.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileSettingsModule } from './profile-settings/profile-settings.module';
import { AddTeacherComponent } from './profile-settings/add-teacher/add-teacher.component';
import { AddSubjectComponent } from './profile-settings/add-subject/add-subject.component';
import { TeacherLoginComponent } from './auth/teacher-login/teacher-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherWeeklySummaryComponent } from './teacher-weekly-summary/teacher-weekly-summary.component';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    TeacherLoginComponent,
    DashboardComponent,
    TeacherWeeklySummaryComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TeacherModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AuthModule,
    NgbModule,
    ProfileSettingsModule,
    SharedModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
