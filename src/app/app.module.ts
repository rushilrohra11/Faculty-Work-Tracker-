import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from './auth/auth.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileSettingsModule } from './profile-settings/profile-settings.module';
import { AddTeacherComponent } from './profile-settings/add-teacher/add-teacher.component';
import { AddSubjectComponent } from './profile-settings/add-subject/add-subject.component';

@NgModule({
  declarations: [
    AppComponent,
    AddTeacherComponent,
    AddSubjectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AuthModule,
    NgbModule,
    ProfileSettingsModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
