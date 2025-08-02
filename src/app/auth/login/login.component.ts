import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder,private database:DatabaseService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login form submitted!', this.loginForm.value);
      if (this.database.getUsers().some(user => user.email === this.loginForm.value.email && user.password === this.loginForm.value.password)) {
        console.log('Login successful for user:', this.loginForm.value.email);
      }
      // Call your authentication service's login method here
      // this.authService.login(this.loginForm.value).subscribe(...);
    }
  }
}
