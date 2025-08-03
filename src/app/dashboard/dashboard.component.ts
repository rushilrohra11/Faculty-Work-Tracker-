import { Component, OnInit } from '@angular/core';
import { Teacher } from '../interfaces/teacher.interface';
import { Task } from '../interfaces/task.interface';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  teachers: Teacher[] = [];
  selectedTeacher: Teacher | null = null;
  currentWeekRange: string = '';

  constructor(private database: DatabaseService) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.currentWeekRange = this.getCurrentWeekRange();
  }

  loadTeachers(): void {
    try {
      // Load data from localStorage through DatabaseService
      this.database.loadData();
      this.teachers = this.database.getTeachers();
      console.log('Loaded teachers from localStorage:', this.teachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      this.teachers = [];
    }
  }

  selectTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
  }

  clearSelection(): void {
    this.selectedTeacher = null;
  }

  getCurrentWeekRange(): string {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
  }

  getCurrentWeekTasks(teacher: Teacher): Task[] {
    if (!teacher.tasks || teacher.tasks.length === 0) return [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toISOString().slice(0, 10);
    const endStr = endOfWeek.toISOString().slice(0, 10);
    
    // Get tasks from DatabaseService to ensure we have the latest data
    const teacherTasks = this.database.getTasksForTeacher(teacher.email);
    
    return teacherTasks.filter(task => {
      return task.date >= startStr && task.date <= endStr;
    });
  }

  calculateTaskHours(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  }

  getTotalWeeklyHours(teacher: Teacher): number {
    const weekTasks = this.getCurrentWeekTasks(teacher);
    return weekTasks.reduce((total, task) => {
      return total + this.calculateTaskHours(task.startTime, task.endTime);
    }, 0);
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getTotalSubjects(teacher: Teacher): number {
    return teacher.subjects?.length || 0;
  }

  // Method to refresh data if needed
  refreshTeachers(): void {
    this.loadTeachers();
  }

  // Method to get teacher's earnings for current week
  getWeeklyEarnings(teacher: Teacher): number {
    const weekTasks = this.getCurrentWeekTasks(teacher);
    let totalEarnings = 0;

    weekTasks.forEach(task => {
      const taskHours = this.calculateTaskHours(task.startTime, task.endTime);
      
      // Find payPerHour for this task's subject
      let payPerHour = 0;
      if (task.subjectName && teacher.subjects) {
        const subject = teacher.subjects.find(s => s.subjectName === task.subjectName);
        payPerHour = subject ? subject.payPerHour : 0;
      } else if (teacher.subjects && teacher.subjects.length > 0) {
        payPerHour = teacher.subjects[0].payPerHour; // fallback to first subject
      }
      
      totalEarnings += taskHours * payPerHour;
    });

    return totalEarnings;
  }

  // Method to check if teacher has any subjects
  hasSubjects(teacher: Teacher): boolean {
    return teacher.subjects && teacher.subjects.length > 0;
  }

  // Method to get all subject names for a teacher
  getSubjectNames(teacher: Teacher): string[] {
    return teacher.subjects?.map(s => s.subjectName) || [];
  }

  // Debug method to check localStorage data
  debugLocalStorageData(): void {
    console.log('=== DEBUG: localStorage Data ===');
    console.log('Teachers from localStorage:', localStorage.getItem('teachers'));
    console.log('Users from localStorage:', localStorage.getItem('registeredUsers'));
    console.log('Subjects from localStorage:', localStorage.getItem('subjects'));
    console.log('Current teachers array:', this.teachers);
    console.log('================================');
  }

  // Method to manually add sample data for testing
  // addSampleData(): void {
  //   const sampleTeacher: Teacher = {
  //     id: 'T001',
  //     name: 'Dr. Sample Teacher',
  //     email: 'sample@example.com',
  //     password: 'password123',
  //     phone: '1234567890',
  //     isActive: true,
  //     subjects: [
  //       { subjectName: 'Mathematics', payPerHour: 500 },
  //       { subjectName: 'Physics', payPerHour: 550 }
  //     ],
  //     tasks: [
  //       {
  //         id: 'task1',
  //         title: 'Algebra Class',
  //         description: 'Basic algebra concepts',
  //         subjectName: 'Mathematics',
  //         date: new Date().toISOString().slice(0, 10), // Today's date
  //         day: 'Monday',
  //         startTime: '10:00',
  //         endTime: '11:30',
  //         completed: false,
  //         createdAt: new Date()
  //       }
  //     ],
  //     createdBy: 'admin@example.com',
  //     createdAt: new Date().toISOString(),
  //     totalEarnings: 0
  //   };

  //   try {
  //     this.database.addTeacher(sampleTeacher);
  //     this.loadTeachers(); // Reload data
  //     console.log('Sample teacher added successfully');
  //   } catch (error) {
  //     console.error('Error adding sample teacher:', error);
  //   }
  // }
}