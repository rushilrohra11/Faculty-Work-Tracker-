import { Component, Input } from '@angular/core';
import { Teacher } from '../interfaces/teacher.interface';
import { DatabaseService } from '../services/database.service';

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-teacher-weekly-summary',
  templateUrl: './teacher-weekly-summary.component.html',
  styleUrls: ['./teacher-weekly-summary.component.css']
})
export class TeacherWeeklySummaryComponent {
  @Input() teacher!: Teacher;
  weeklyTasks: Task[] = [];
  totalHours = 0;
  totalSalary = 0;

  constructor(private database: DatabaseService) {}

  ngOnInit(): void {
    this.loadWeeklySummary();
  }

  loadWeeklySummary(): void {
    const allTasks = this.database.getTasksForTeacher(this.teacher.email);
    const weekStart = this.getWeekStart(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Filter tasks for this week
    this.weeklyTasks = allTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate < weekEnd;
    });

    // Calculate total hours and salary
    this.totalHours = 0;
    this.totalSalary = 0;
    for (const task of this.weeklyTasks) {
      const hours = this.calculateTaskHours(task.startTime, task.endTime);
      this.totalHours += hours;

      // Find payPerHour for the subject (if available)
      let payPerHour = 0;
      if (this.teacher.subjects && this.teacher.subjects.length > 0) {
        // If you store subjectName in task, you can match here
        payPerHour = this.teacher.subjects[0].payPerHour; // Simplified: use first subject
      }
      this.totalSalary += hours * payPerHour;
    }
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Sunday as start
    return d;
  }

  calculateTaskHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  }

}
