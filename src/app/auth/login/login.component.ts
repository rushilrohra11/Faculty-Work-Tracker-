import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { Router } from '@angular/router';
import { 
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faExclamationCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Font Awesome Icons
  protected faUser = faUser;
  protected faEnvelope = faEnvelope;
  protected faLock = faLock;
  protected faEye = faEye;
  protected faEyeSlash = faEyeSlash;
  protected faExclamationCircle = faExclamationCircle;
  protected faSpinner = faSpinner;

  loginForm!: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private database: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkExistingLogin();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  checkExistingLogin(): void {
    if (this.database.isCurrentUserAdmin()) {
      console.log('Admin already logged in:', this.database.getCurrentAdminEmail());
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';

      const { email, password } = this.loginForm.value;
      
      console.log('Login attempt for:', email);

      // Find user in the database
      const user = this.database.getUsers().find(user => 
        user.email === email && 
        user.password === password
      );

      if (user) {
        if (user.isAdmin === true) {
          // Update user's login status in the users array
          user.isLoggedInAdmin = true;
          user.isLoggedIn = true; // Add this for general login status
          user.lastLoginTime = new Date().toISOString(); // Optional: add login timestamp
          
          // Update the user in the database
          this.database.updateUserLoginStatus(user);
          
          // Set admin login status and store user data
          this.database.setAdminLoginStatus(true, email, user);
          
          console.log('Admin login successful:', email);
          alert('Welcome Admin! Login successful.');
          
        } else {
          // Handle regular user login
          user.isLoggedIn = true;
          localStorage.setItem('isLoggedInUser', 'true');
          user.lastLoginTime = new Date().toISOString();
          
          // Update the user in the database
          this.database.updateUserLoginStatus(user);
          
          console.log('Regular user login successful:', email);
          alert('Welcome! Login successful.');
        }
        
        // Clear form
        this.loginForm.reset();
        
      } else {
        this.loginError = 'Invalid email or password. Please try again.';
        console.log('Login failed for:', email);
      }

      this.isLoading = false;
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  onLogout(): void {
    const currentUser = this.database.getCurrentAdminUser();
    if (currentUser) {
      currentUser.isLoggedInAdmin = false;
      currentUser.isLoggedIn = false; // Add this for general login status
      currentUser.lastLogoutTime = new Date().toISOString(); // Optional: add logout timestamp
      this.database.updateUserLoginStatus(currentUser);
    }
    
    this.database.setAdminLoginStatus(false, '', null);
    
    console.log('User logged out successfully');
    alert('Logged out successfully!');
    
    this.loginForm.reset();
    this.loginError = '';
  }

  get isLoggedInAdmin(): boolean {
    return this.database.isCurrentUserAdmin();
  }

  get currentAdminEmail(): string {
    return this.database.getCurrentAdminEmail();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  createDemoAdmin(): void {
    const demoAdmin = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true,
      isLoggedInAdmin: false,
      isLoggedIn: false, // Add general login status
      name: 'Demo Admin',
      subjects: [],
      createdAt: new Date().toISOString()
    };
    
    const existingAdmin = this.database.getUsers().find(user => user.email === demoAdmin.email);
    
    if (!existingAdmin) {
      this.database.addUser(demoAdmin);
      console.log('Demo admin created:', demoAdmin.email);
      alert('Demo admin created! Email: admin@example.com, Password: admin123');
    } else {
      alert('Demo admin already exists! Email: admin@example.com, Password: admin123');
    }
  }
}