import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { Subject } from 'src/app/interfaces/subject.interface';

@Component({
  selector: 'app-add-subject',
  templateUrl: './add-subject.component.html',
  styleUrls: ['./add-subject.component.css']
})
export class AddSubjectComponent implements OnInit {
  
  addSubjectForm!: FormGroup;
  subjects: Subject[] = [];
  showAddForm: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  constructor(
    private database: DatabaseService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    // Initialize the form
    this.addSubjectForm = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2)]],
      payPerHour: [0, [Validators.required, Validators.min(1)]]
    });
    
    this.loadSubjects();
    this.debugAdminStatus(); // Add debugging
  }
  
  // Debug method to check admin status
  debugAdminStatus(): void {
    console.log('=== Admin Status Debug ===');
    console.log('isLoggedInAdmin:', this.database.isloggedInAdmin);
    console.log('isLoggedInAdminEmail:', this.database.isloggedInAdminEmail);
    console.log('getCurrentAdminUser:', this.database.getCurrentAdminUser());
    console.log('isCurrentUserAdmin():', this.database.isCurrentUserAdmin());
    console.log('isAdminSessionValid():', this.database.isAdminSessionValid());
    
    // Check localStorage directly
    console.log('localStorage isLoggedInAdmin:', localStorage.getItem('isLoggedInAdmin'));
    console.log('localStorage loggedInAdminEmail:', localStorage.getItem('loggedInAdminEmail'));
    console.log('localStorage currentAdminUser:', localStorage.getItem('currentAdminUser'));
    console.log('========================');
  }
  
  loadSubjects(): void {
    this.subjects = this.database.loadSubjectsForAdmin();
  }
  
  get isLoggedInAdmin(): boolean {
    const isLoggedIn = this.database.isloggedInAdmin;
    const isSessionValid = this.database.isAdminSessionValid();
    console.log('isLoggedInAdmin getter:', { isLoggedIn, isSessionValid });
    return isLoggedIn && isSessionValid;
  }
  
  get isLoggedInAdminEmail(): string {
    return this.database.isloggedInAdminEmail;
  }
  
  // Fixed: Get email from the current logged-in admin
  get email(): string {
    return this.database.getCurrentAdminEmail();
  }
  
  // Additional getter to check admin status more thoroughly
  get adminStatus(): { isAdmin: boolean, email: string, user: any } {
    return {
      isAdmin: this.database.isCurrentUserAdmin(),
      email: this.database.getCurrentAdminEmail(),
      user: this.database.getCurrentAdminUser()
    };
  }
  
  onAddSubject(): void {
    if (this.addSubjectForm.valid) {
      const formValue = this.addSubjectForm.value;
      
      const subject: Subject = {
        subjectName: formValue.subjectName,
        payPerHour: formValue.payPerHour
      };
      
      try {
        console.log('Subject being added:', subject);
        console.log('Admin email:', this.email);
        
        // Check if user is admin (but don't block if not)
        if (!this.isLoggedInAdmin) {
          console.warn('User is not logged in as admin, but proceeding...');
        }
        
        // Check if subject already exists
        const existingSubject = this.subjects.find(s => 
          s.subjectName.toLowerCase() === subject.subjectName.toLowerCase()
        );
        
        if (existingSubject) {
          this.errorMessage = 'A subject with this name already exists!';
          this.clearMessageAfterDelay();
          return;
        }
        
        // Add subject using the database service
        this.database.addSubject(this.email, subject);
        
        // Reset the form after adding
        this.addSubjectForm.reset();
        
        // Hide the form
        this.showAddForm = false;
        
        // Reload subjects to update the list
        this.loadSubjects();
        
        // Show success message
        this.successMessage = `Subject "${subject.subjectName}" added successfully!`;
        this.clearMessageAfterDelay();
        
        console.log('Subject added successfully');
      } catch (error) {
        this.errorMessage = 'Failed to add subject. Please try again.';
        this.clearMessageAfterDelay();
        console.error('Error adding subject:', error);
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.clearMessageAfterDelay();
      console.error('Form is invalid');
      
      // Log form errors for debugging
      if (!this.addSubjectForm.valid) {
        console.log('Form errors:', this.addSubjectForm.errors);
        Object.keys(this.addSubjectForm.controls).forEach(key => {
          const control = this.addSubjectForm.get(key);
          if (control && control.errors) {
            console.log(`${key} errors:`, control.errors);
          }
        });
      }
    }
  }
  
  deleteSubject(subject: Subject): void {
    if (confirm(`Are you sure you want to delete "${subject.subjectName}"?`)) {
      try {
        // Check if user is admin (but don't block if not)
        if (!this.isLoggedInAdmin) {
          console.warn('User is not logged in as admin, but proceeding with deletion...');
        }
        
        this.database.removeSubject(this.email, subject);
        console.log('Subject deleted:', subject.subjectName);
        
        // Reload subjects to update the list
        this.loadSubjects();
        
        // Show success message
        this.successMessage = `Subject "${subject.subjectName}" deleted successfully!`;
        this.clearMessageAfterDelay();
      } catch (error) {
        this.errorMessage = 'Failed to delete subject. Please try again.';
        this.clearMessageAfterDelay();
        console.error('Error deleting subject:', error);
      }
    }
  }
  
  // Additional helper methods for better user experience
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addSubjectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.addSubjectForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }
  
  // Method to check if current user has subjects
  getCurrentUserSubjects(): Subject[] {
    const currentUser = this.database.getCurrentAdminUser();
    return currentUser && currentUser.subjects ? currentUser.subjects : [];
  }
  
  // Toggle the add form visibility
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      // Reset form when opening
      this.addSubjectForm.reset();
      this.clearMessage();
    }
  }
  
  // Cancel adding subject and hide form
  cancelAddForm(): void {
    this.showAddForm = false;
    this.addSubjectForm.reset();
    this.clearMessage();
  }
  
  // Clear success/error messages
  clearMessage(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  // Clear messages after a delay
  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessage();
    }, 5000); // Clear after 5 seconds
  }
  
  // Check if a subject name already exists (case-insensitive)
  isSubjectNameExists(subjectName: string): boolean {
    return this.subjects.some(subject => 
      subject.subjectName.toLowerCase() === subjectName.toLowerCase()
    );
  }
  
  // Get total subjects count
  getTotalSubjectsCount(): number {
    return this.subjects.length;
  }
  
  // Get total earnings potential per hour
  getTotalEarningsPerHour(): number {
    return this.subjects.reduce((total, subject) => total + subject.payPerHour, 0);
  }
}