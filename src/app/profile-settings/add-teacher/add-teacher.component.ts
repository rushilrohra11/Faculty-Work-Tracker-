import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { Subject } from 'src/app/interfaces/subject.interface';
import { Teacher } from 'src/app/interfaces/teacher.interface';

@Component({
  selector: 'app-add-teacher',
  templateUrl: './add-teacher.component.html',
  styleUrls: ['./add-teacher.component.css']
})
export class AddTeacherComponent implements OnInit {
  
  addTeacherForm!: FormGroup;
  teachers: Teacher[] = [];
  availableSubjects: Subject[] = [];
  selectedSubjects: Subject[] = [];
  showCredentials: boolean = false;
  lastGeneratedCredentials: { teacherId: string, password: string } | null = null;
  isLoading: boolean = false;
  
  constructor(
    private database: DatabaseService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    console.log(this.isLoggedInAdmin)
  }
  
  initializeForm(): void {
    this.addTeacherForm = this.fb.group({
      teacherName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required]]
    });

    // Debug logging for form validation
    this.addTeacherForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Valid:', this.addTeacherForm.valid);
      console.log('Form Errors:', this.addTeacherForm.errors);
      console.log('Form Values:', this.addTeacherForm.value);
      console.log('Selected Subjects:', this.selectedSubjects.length);
    });
  }
  
  loadData(): void {
    this.isLoading = true;
    try {
      this.availableSubjects = this.database.loadSubjectsForAdmin();
      this.teachers = this.database.getTeachers() || [];
    } catch (error) {
      this.showNotification('Failed to load data. Please try again.', 'error');
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  get isLoggedInAdmin(): boolean {
    // Check both database admin status and localStorage
    const isAdmin = this.database.isloggedInAdmin;
    const isLoggedInUser = localStorage.getItem('isLoggedInUser') === 'true';
    console.log('isLoggedInAdmin:', isAdmin);
    console.log('isLoggedInUser from localStorage:', isLoggedInUser);
    return isAdmin || isLoggedInUser;
  }
  
  get adminEmail(): string {
    const email = this.database.isloggedInAdminEmail;
    console.log('adminEmail:', email);
    return email;
  }
  
  generateTeacherId(): string {
    const prefix = 'TCH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
  
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  toggleSubject(subject: Subject): void {
    const index = this.selectedSubjects.findIndex(s => s.subjectName === subject.subjectName);
    if (index > -1) {
      this.selectedSubjects.splice(index, 1);
      console.log(`Removed subject: ${subject.subjectName}. Total subjects: ${this.selectedSubjects.length}`);
    } else {
      this.selectedSubjects.push({...subject});
      console.log(`Added subject: ${subject.subjectName}. Total subjects: ${this.selectedSubjects.length}`);
    }
  }
  
  isSubjectSelected(subject: Subject): boolean {
    return this.selectedSubjects.some(s => s.subjectName === subject.subjectName);
  }
  
  removeSelectedSubject(subject: Subject): void {
    this.selectedSubjects = this.selectedSubjects.filter(s => s.subjectName !== subject.subjectName);
    this.showNotification('Subject removed', 'success');
  }
  
  onAddTeacher(): void {
    if (!this.isLoggedInAdmin) {
      this.showNotification('Only admin can add teachers', 'error');
      return;
    }
    
    if (this.addTeacherForm.invalid) {
      this.markFormAsTouched();
      this.showNotification('Please fill all required fields correctly', 'error');
      return;
    }
    
    if (this.selectedSubjects.length === 0) {
      this.showNotification('Please select at least one subject', 'error');
      return;
    }
    
    const formValue = this.addTeacherForm.value;
    const teacherId = this.generateTeacherId();
    const password = this.generatePassword();
    
    const teacher: Teacher = {
      id: teacherId,
      name: formValue.teacherName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      address: formValue.address.trim(),
      subjects: [...this.selectedSubjects],
      password: password,
      isActive: true,
      createdBy: this.adminEmail,
      createdAt: new Date().toISOString(),
      totalEarnings: 0
    };
    
    try {
      this.database.addTeacher(teacher);
      this.lastGeneratedCredentials = {
        teacherId: teacherId,
        password: password
      };
      this.showCredentials = true;
      
      this.addTeacherForm.reset();
      this.selectedSubjects = [];
      this.loadData();
      
      this.showNotification('Teacher added successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to add teacher. Please try again.', 'error');
      console.error('Error adding teacher:', error);
    }
  }
  
  deleteTeacher(teacher: Teacher): void {
    if (!this.isLoggedInAdmin) {
      this.showNotification('Only admin can delete teachers', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to permanently delete ${teacher.name}? This action cannot be undone.`)) {
      try {
        this.database.removeTeacher(teacher.id);
        this.loadData();
        this.showNotification('Teacher deleted successfully', 'success');
      } catch (error) {
        this.showNotification('Failed to delete teacher', 'error');
        console.error('Error deleting teacher:', error);
      }
    }
  }
  
  toggleTeacherStatus(teacher: Teacher): void {
    if (!this.isLoggedInAdmin) {
      this.showNotification('Only admin can modify teacher status', 'error');
      return;
    }
    
    teacher.isActive = !teacher.isActive;
    try {
      this.database.updateTeacher(teacher);
      const status = teacher.isActive ? 'activated' : 'deactivated';
      this.showNotification(`Teacher ${status} successfully`, 'success');
    } catch (error) {
      teacher.isActive = !teacher.isActive; // Revert on error
      this.showNotification('Failed to update teacher status', 'error');
      console.error('Error updating teacher:', error);
    }
  }
  
  closeCredentialsModal(): void {
    this.showCredentials = false;
    this.lastGeneratedCredentials = null;
  }
  
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
      this.showNotification('Failed to copy text', 'error');
      console.error('Failed to copy: ', err);
    });
  }
  
  private markFormAsTouched(): void {
    Object.values(this.addTeacherForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
  
  private showNotification(message: string, type: 'success' | 'error'): void {
    alert(`${type.toUpperCase()}: ${message}`);
  }
}