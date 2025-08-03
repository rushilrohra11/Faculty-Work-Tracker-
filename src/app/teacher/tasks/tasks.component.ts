import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faCalendarAlt,
  faClock, 
  faEdit, 
  faTrashAlt, 
  faCheckCircle, 
  faTimesCircle,
  faSort,
  faSortAlphaDown,
  faSortNumericDown,
  faPlusCircle as faAdd,
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { DatabaseService } from 'src/app/services/database.service';

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
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  animations: [
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 0, transform: 'translateX(-50px)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ transform: 'scale(0.8) translateY(50px)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ transform: 'scale(1) translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ transform: 'scale(0.8) translateY(50px)', opacity: 0 }))
      ])
    ])
  ]
})
export class TasksComponent implements OnInit {
  // Font Awesome Icons
  protected faCalendarAlt = faCalendarAlt;
  protected faClock = faClock;
  protected faEdit = faEdit;
  protected faTrashAlt = faTrashAlt;
  protected faCheckCircle = faCheckCircle;
  protected faTimesCircle = faTimesCircle;
  protected faSort = faSort;
  protected faSortAlphaDown = faSortAlphaDown;
  protected faSortNumericDown = faSortNumericDown;
  protected faAdd = faAdd;
  protected faExclamationCircle = faExclamationCircle;
  protected faTimes = faTimes;

  taskForm: FormGroup;
  tasks: Task[] = [];
  pendingTasks: Task[] = [];
  completedTasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: 'all' | 'pending' | 'completed' = 'all';
  sortBy: 'date' | 'title' = 'date';
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  private readonly STORAGE_KEY = 'tasks_data';

  constructor(
    private fb: FormBuilder,
    private database: DatabaseService // Inject the service
  ) {
    this.taskForm = this.createForm();
  }


  ngOnInit(): void {
    this.loadTasks();
    this.updateFilteredTasks();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100),
        this.noWhitespaceValidator
      ]],
      description: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500),
        this.noWhitespaceValidator
      ]],
      date: ['', [Validators.required, this.futureDateValidator]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { 
      validators: [this.timeValidator, this.duplicateTaskValidator.bind(this)]
    });
  }

  // Custom Validators
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return { pastDate: true };
      }
    }
    return null;
  }

  private timeValidator(group: FormGroup): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    
    if (start && end) {
      const startTime = new Date(`2000/01/01 ${start}`);
      const endTime = new Date(`2000/01/01 ${end}`);
      
      if (startTime >= endTime) {
        return { timeError: true };
      }

      // Check if duration is at least 15 minutes
      const diffInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (diffInMinutes < 15) {
        return { minimumDuration: true };
      }
    }
    return null;
  }

  private duplicateTaskValidator(group: FormGroup): ValidationErrors | null {
    const title = group.get('title')?.value;
    const date = group.get('date')?.value;
    const startTime = group.get('startTime')?.value;
    
    if (title && date && startTime) {
      const duplicate = this.tasks.find(task => 
        task.title.toLowerCase() === title.toLowerCase() &&
        task.date === date &&
        task.startTime === startTime
      );
      
      if (duplicate) {
        return { duplicate: true };
      }
    }
    return null;
  }

  // Form Validation Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
    if (errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['whitespace']) return `${this.getFieldDisplayName(fieldName)} cannot be empty`;
    if (errors['pastDate']) return 'Date cannot be in the past';
    
    return 'Invalid input';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      date: 'Date',
      startTime: 'Start time',
      endTime: 'End time'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Form Submission
  async onSubmit(): Promise<void> {
    if (this.taskForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      await this.delay(800);

      const formValue = this.taskForm.value;
      const date = new Date(formValue.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const newTask: Task = {
        id: this.generateId(),
        title: formValue.title.trim(),
        description: formValue.description.trim(),
        date: formValue.date,
        day: days[date.getDay()],
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        completed: false,
        createdAt: new Date()
      };

      const email = this.database.getLoggedInTeacherEmail();
      if (email) {
        this.database.addTaskForTeacher(email, newTask);
        this.tasks = this.database.getTasksForTeacher(email);
      }

      this.updateFilteredTasks();
      this.taskForm.reset();

      this.showSuccessToast('Task created successfully!');
    } catch (error) {
      this.showSuccessToast('Error creating task. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Task Management
  toggleTask(index: number): void {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks[index].completed = !this.tasks[index].completed;
      const email = this.database.getLoggedInTeacherEmail();
      if (email) {
        this.database.updateTaskForTeacher(email, this.tasks[index]);
      }
      this.updateFilteredTasks();
      const status = this.tasks[index].completed ? 'completed' : 'reopened';
      this.showSuccessToast(`Task ${status}!`);
    }
  }

  editTask(index: number): void {
    if (index >= 0 && index < this.tasks.length) {
      const task = this.tasks[index];
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime
      });

      // Remove the task being edited to avoid duplicate validation
      const email = this.database.getLoggedInTeacherEmail();
      if (email) {
        this.database.removeTaskForTeacher(email, task.id);
        this.tasks = this.database.getTasksForTeacher(email);
      }
      this.updateFilteredTasks();
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  }


  deleteTask(task: Task): void {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmDelete) return;

    const email = this.database.getLoggedInTeacherEmail();
    if (email) {
      this.database.removeTaskForTeacher(email, task.id);
      this.tasks = this.database.getTasksForTeacher(email);
    }
    this.updateFilteredTasks();
    this.showSuccessToast('Task deleted successfully!');
  }

  // Filtering and Sorting
  setFilter(filter: 'all' | 'pending' | 'completed'): void {
    this.currentFilter = filter;
    this.updateFilteredTasks();
  }

  sortTasks(): void {
    this.updateFilteredTasks();
  }

  private updateFilteredTasks(): void {
    // Update task lists
    this.pendingTasks = this.tasks.filter(task => !task.completed);
    this.completedTasks = this.tasks.filter(task => task.completed);

    // Get the appropriate list based on filter
    let filtered: Task[] = [];
    switch (this.currentFilter) {
      case 'pending':
        filtered = [...this.pendingTasks];
        break;
      case 'completed':
        filtered = [...this.completedTasks];
        break;
      default:
        filtered = [...this.tasks];
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          const dateA = new Date(`${a.date} ${a.startTime}`);
          const dateB = new Date(`${b.date} ${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        
        case 'title':
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

    this.filteredTasks = filtered;
  }

  getFilteredTasks(): Task[] {
    return this.filteredTasks;
  }

  // Helper Methods
  getOriginalIndex(task: Task): number {
    return this.tasks.findIndex(t => t.id === task.id);
  }

  trackByTask(index: number, task: Task): string {
    return task.id;
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();
    }
    return `${minutes}m`;
  }

  getCompletionRate(): number {
    if (this.tasks.length === 0) return 0;
    const completedTasks = this.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / this.tasks.length) * 100);
  }

  getEmptyStateTitle(): string {
    switch (this.currentFilter) {
      case 'pending':
        return 'No pending tasks';
      case 'completed':
        return 'No completed tasks';
      default:
        return 'No tasks yet';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.currentFilter) {
      case 'pending':
        return 'All your tasks are completed! Great job! 🎉';
      case 'completed':
        return 'Complete some tasks to see them here.';
      default:
        return 'Create your first task to get started with organizing your day.';
    }
  }

  // Storage Methods
 private loadTasks(): void {
    try {
      const email = this.database.getLoggedInTeacherEmail();
      if (email) {
        this.tasks = this.database.getTasksForTeacher(email).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
      } else {
        this.tasks = [];
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }

  // ...existing code...



// In your onSubmit(), just push to this.tasks and call saveTasks() as you do now.
// ...existing code...

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Keyboard Navigation
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.taskForm.valid && !this.isSubmitting) {
        this.onSubmit();
      }
    }
  }
}