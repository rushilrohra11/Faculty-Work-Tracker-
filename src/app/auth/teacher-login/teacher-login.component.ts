import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-teacher-login',
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.css']
})
export class TeacherLoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private database: DatabaseService // <-- Inject the service
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      setTimeout(() => {
        const { email, password } = this.loginForm.value;
        // Find teacher in teachers array
        const teacher = this.database.getTeachers().find(t => t.email === email && t.password === password);
        if (teacher) {
          // Set login status in teachers array
          teacher.isloggedInTeacher = true;
          this.database['updateTeachersLocalStorage'](); // Persist change
          // Also update service state for current session
          this.database.isloggedInTeacher = true;
          this.database.isloggedInTeacheremail = email;
          this.router.navigate(['/teacher-dashboard']);
        } else {
          this.loginError = 'Invalid email or password';
        }
        this.isLoading = false;
      }, 1500);

    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
