import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  registerSuccess = false;
  registerError = '';

  constructor(private fb: FormBuilder, private database: DatabaseService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  // Custom validator for password matching
  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.registerError = '';
    this.registerSuccess = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.registerForm.value;

    if (this.database.getUsers().some((user) => user.email === email)) {
      this.registerError = 'A user with this email already exists.';
      return;
    }

    this.database.addUser({ email, password });
    this.registerSuccess = true;
    console.log('User registered:', { email, password });

    this.registerForm.reset();
  }
}
