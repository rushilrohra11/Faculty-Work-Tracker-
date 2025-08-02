import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder, private router: Router) {
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
        if (email === 'teacher@example.com' && password === 'teacher123') {
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
