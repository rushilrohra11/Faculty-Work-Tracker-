import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { AddSubjectComponent } from './add-subject/add-subject.component';
import { AddTeacherComponent } from './add-teacher/add-teacher.component';



@NgModule({
  declarations: [
    SettingsComponent,
    AddSubjectComponent,
    AddTeacherComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[
    
  ]
})
export class ProfileSettingsModule { }
