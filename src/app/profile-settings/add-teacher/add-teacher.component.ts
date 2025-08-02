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
  
  constructor(
    private database: DatabaseService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadAvailableSubjects();
    this.loadTeachers();
  }
  
  initializeForm(): void {
    this.addTeacherForm = this.fb.group({
      teacherName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required]]
    });
  }
  
  loadAvailableSubjects(): void {
    this.availableSubjects = this.database.loadSubjectsForAdmin();
  }
  
  loadTeachers(): void {
    this.teachers = this.database.getTeachers() || [];
  }
  
  get isLoggedInAdmin(): boolean {
    return this.database.isloggedInAdmin;
  }
  
  get adminEmail(): string {
    return this.database.isloggedInAdminEmail;
  }
  
  // Generate unique teacher ID
  generateTeacherId(): string {
    const prefix = 'TCH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
  
  // Generate secure password
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  // Toggle subject selection
  toggleSubject(subject: Subject): void {
    const index = this.selectedSubjects.findIndex(s => s.subjectName === subject.subjectName);
    if (index > -1) {
      this.selectedSubjects.splice(index, 1);
    } else {
      this.selectedSubjects.push(subject);
    }
  }
  
  // Check if subject is selected
  isSubjectSelected(subject: Subject): boolean {
    return this.selectedSubjects.some(s => s.subjectName === subject.subjectName);
  }
  
  // Remove selected subject
  removeSelectedSubject(subject: Subject): void {
    this.selectedSubjects = this.selectedSubjects.filter(s => s.subjectName !== subject.subjectName);
  }
  
  onAddTeacher(): void {
    if (this.isLoggedInAdmin && this.addTeacherForm.valid && this.selectedSubjects.length > 0) {
      const formValue = this.addTeacherForm.value;
      const teacherId = this.generateTeacherId();
      const password = this.generatePassword();
      
      const teacher: Teacher = {
        id: teacherId,
        name: formValue.teacherName,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        subjects: [...this.selectedSubjects],
        password: password,
        isActive: true,
        createdBy: this.adminEmail,
        createdAt: new Date().toISOString(),
        totalEarnings: 0
      };
      
      // Save teacher to database
      this.database.addTeacher(teacher);
      
      // Show generated credentials
      this.lastGeneratedCredentials = {
        teacherId: teacherId,
        password: password
      };
      this.showCredentials = true;
      
      console.log('Teacher added successfully:', teacher.name);
      
      // Reset form and selections
      this.addTeacherForm.reset();
      this.selectedSubjects = [];
      
      // Reload teachers list
      this.loadTeachers();
    } else {
      console.error('Form is invalid, user is not admin, or no subjects selected');
      if (this.selectedSubjects.length === 0) {
        alert('Please select at least one subject for the teacher');
      }
    }
  }
  
  deleteTeacher(teacher: Teacher): void {
    if (this.isLoggedInAdmin && confirm(`Are you sure you want to delete teacher ${teacher.name}?`)) {
      this.database.removeTeacher(teacher.id);
      console.log('Teacher deleted:', teacher.name);
      this.loadTeachers();
    }
  }
  
  toggleTeacherStatus(teacher: Teacher): void {
    if (this.isLoggedInAdmin) {
      teacher.isActive = !teacher.isActive;
      this.database.updateTeacher(teacher);
      console.log(`Teacher ${teacher.name} ${teacher.isActive ? 'activated' : 'deactivated'}`);
    }
  }
  
  closeCredentialsModal(): void {
    this.showCredentials = false;
    this.lastGeneratedCredentials = null;
  }
  
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}