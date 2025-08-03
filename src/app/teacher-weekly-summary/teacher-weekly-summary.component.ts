import { Component, Input, OnInit } from '@angular/core';
import { Teacher } from '../interfaces/teacher.interface';
import { DatabaseService } from '../services/database.service';
import { Task } from '../interfaces/task.interface';



interface DailySummary {
  day: string;
  date: string;
  lectures: number;
  hours: number;
  earnings: number;
  tasks: Task[];
}

@Component({
  selector: 'app-teacher-weekly-summary',
  templateUrl: './teacher-weekly-summary.component.html',
  styleUrls: ['./teacher-weekly-summary.component.css']
})
export class TeacherWeeklySummaryComponent implements OnInit {
  @Input() teacher!: Teacher;
  
  weekStart: Date = this.getWeekStart(new Date());
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dailySummary: DailySummary[] = [];
  totalHours = 0;
  totalSalary = 0;
  totalLectures = 0;
  
  // Loading state
  isLoading = false;
  
  // Current teacher data from localStorage
  currentTeacherData: Teacher | null = null;

  constructor(private database: DatabaseService) {}

  ngOnInit(): void {
    this.loadWeeklySummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacher'] && !changes['teacher'].firstChange) {
      this.loadWeeklySummary();
    }
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.loadWeeklySummary();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.loadWeeklySummary();
  }

  loadWeeklySummary(): void {
    if (!this.teacher?.email) {
      console.error('No teacher email provided');
      return;
    }

    this.isLoading = true;
    
    try {
      // Load fresh data from localStorage
      this.database.loadData();
      
      // Get updated teacher data
      this.currentTeacherData = this.database.getTeachers()
        .find(t => t.email === this.teacher.email) || this.teacher;
      
      // Get all tasks for this teacher from localStorage
      const allTasks = this.database.getTasksForTeacher(this.teacher.email);
      
      console.log(`Loading weekly summary for ${this.teacher.name}:`, {
        email: this.teacher.email,
        totalTasks: allTasks.length,
        weekStart: this.weekStart.toISOString().slice(0, 10)
      });

      this.dailySummary = [];
      this.totalHours = 0;
      this.totalSalary = 0;
      this.totalLectures = 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(this.weekStart);
        dayDate.setDate(this.weekStart.getDate() + i);
        const dayStr = dayDate.toISOString().slice(0, 10);

        const tasksForDay = allTasks.filter(task => task.date === dayStr);

        let hours = 0;
        let daySalary = 0;
        
        for (const task of tasksForDay) {
          const taskHours = this.calculateTaskHours(task.startTime, task.endTime);
          hours += taskHours;

          // Find payPerHour for this task's subject from current teacher data
          let payPerHour = 0;
          if (task.subjectName && this.currentTeacherData?.subjects) {
            const subj = this.currentTeacherData.subjects.find(s => s.subjectName === task.subjectName);
            payPerHour = subj ? subj.payPerHour : 0;
          } else if (this.currentTeacherData?.subjects && this.currentTeacherData.subjects.length > 0) {
            payPerHour = this.currentTeacherData.subjects[0].payPerHour; // fallback
          }
          
          daySalary += taskHours * payPerHour;
        }

        const dailyData: DailySummary = {
          day: this.daysOfWeek[i],
          date: dayStr,
          lectures: tasksForDay.length,
          hours: hours,
          earnings: daySalary,
          tasks: tasksForDay
        };

        this.dailySummary.push(dailyData);

        this.totalSalary += daySalary;
        this.totalHours += hours;
        this.totalLectures += tasksForDay.length;
      }

      console.log('Weekly summary loaded:', {
        totalLectures: this.totalLectures,
        totalHours: this.totalHours,
        totalSalary: this.totalSalary,
        dailySummary: this.dailySummary
      });

    } catch (error) {
      console.error('Error loading weekly summary:', error);
    } finally {
      this.isLoading = false;
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

  // Helper methods for template
  getWeekEndDate(): Date {
    const weekEnd = new Date(this.weekStart);
    weekEnd.setDate(this.weekStart.getDate() + 6);
    return weekEnd;
  }

  getWeekRange(): string {
    const weekEnd = this.getWeekEndDate();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return `${this.weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
  }

  getWeekNumber(): number {
    const firstDayOfYear = new Date(this.weekStart.getFullYear(), 0, 1);
    const pastDaysOfYear = (this.weekStart.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getAverageHours(): number {
    return this.totalHours / 7;
  }

  // Method to refresh data manually
  refreshData(): void {
    this.loadWeeklySummary();
  }

  // Method to get task details for a specific day
  getTasksForDay(dayData: DailySummary): Task[] {
    return dayData.tasks || [];
  }

  // Method to format time for display
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Method to get day status
  getDayStatus(dayData: DailySummary): string {
    if (dayData.lectures === 0) return 'Rest Day';
    if (dayData.hours > 6) return 'Heavy';
    if (dayData.hours > 4) return 'Moderate';
    return 'Light';
  }

  // Method to check if it's today
  isToday(dateStr: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return dateStr === today;
  }

  // Debug method
  debugTeacherData(): void {
    console.log('=== DEBUG: Teacher Weekly Summary ===');
    console.log('Input teacher:', this.teacher);
    console.log('Current teacher data from DB:', this.currentTeacherData);
    console.log('Week start:', this.weekStart);
    console.log('Week range:', this.getWeekRange());
    console.log('Daily summary:', this.dailySummary);
    console.log('Total stats:', {
      lectures: this.totalLectures,
      hours: this.totalHours,
      salary: this.totalSalary
    });
}
}