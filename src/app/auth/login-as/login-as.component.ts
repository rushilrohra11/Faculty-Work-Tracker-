import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-as',
  templateUrl: './login-as.component.html',
  styleUrls: ['./login-as.component.css']
})
export class LoginAsComponent {

  constructor(private router: Router) {}
  loginAsTeacher(): void {
    // Logic to log in as a teacher
    this.router.navigate(['/teacher-login']);
    console.log('Logging in as Teacher');
    // Redirect to teacher login page or perform necessary actions
  }

  LoginAsAdmin(): void {
    // Logic to log in as an admin
    this.router.navigate(['/login']);
    console.log('Logging in as Admin');
    // Redirect to admin login page or perform necessary actions
  }
}
