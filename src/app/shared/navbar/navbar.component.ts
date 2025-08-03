import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentRoute: string = '';
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  userRole: string | null = null;

  constructor(private router: Router) {
    // Listen for route changes to update currentRoute
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      this.checkLogin();
    });
    this.checkLogin();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  checkLogin() {
    // Example: check localStorage for login info
    const teacher = localStorage.getItem('teacher');
    const admin = localStorage.getItem('admin');
    if (teacher) {
      this.isLoggedIn = true;
      this.userRole = 'teacher';
    } else if (admin) {
      this.isLoggedIn = true;
      this.userRole = 'admin';
    } else {
      this.isLoggedIn = false;
      this.userRole = null;
    }
  }

  logout() {
    // Remove login info from localStorage
    localStorage.removeItem('teacher');
    localStorage.removeItem('admin');
    this.isLoggedIn = false;
    this.userRole = null;
    this.router.navigate(['/loginAs']);
  }
}