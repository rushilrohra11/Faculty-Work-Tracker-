import { Component } from '@angular/core';
import { Teacher } from '../interfaces/teacher.interface';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  teachers: Teacher[] = [];
  selectedTeacher: Teacher | null = null;

  constructor(private database: DatabaseService) {}

  ngOnInit(): void {
    this.teachers = this.database.getTeachers();
  }

  selectTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
  }

  clearSelection(): void {
    this.selectedTeacher = null;
  }
}
