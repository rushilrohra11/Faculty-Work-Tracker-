import { Injectable } from '@angular/core';
import { Subject } from '../interfaces/subject.interface';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly USERS_KEY = 'registeredUsers';
  private users: any[] = [];

  isloggedInAdmin: boolean = false;
  isloggedInAdminEmail: string = '';

  subjects: Subject[] = [];

  constructor() {
    this.loadUsersFromStorage();
  }

  /** Load users from localStorage at startup */
  private loadUsersFromStorage(): void {
    const data = localStorage.getItem(this.USERS_KEY);
    this.users = data ? JSON.parse(data) : [];
  }

  /** Save the current user list to localStorage */
  private updateLocalStorage(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }


  loadData(): void {
    this.users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    this.subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    console.log('Data loaded from localStorage:', this.users, this.subjects);
  }

  loadSubjectsForAdmin(){
    this.subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    return this.subjects;
  }
  /** Add new user and persist it */
  addUser(user: any): void {
    this.users.push(user);
    this.updateLocalStorage();
    console.log('User added:', user);
  }

  /** Get users from internal state */
  getUsers(): any[] {
    return [...this.users]; // return a copy to avoid mutation
  }

  /** Clear all users */
  clearUsers(): void {
    this.users = [];
    this.updateLocalStorage();
    console.log('All users cleared');
  }


  addSubject(email:string,subject: Subject): void {
    this.subjects.push(subject);
    console.log('Subject added:', subject);
    // Here you can also update the user object if needed
    const user = this.users.find(user => user.email === email);
    if (user) {
      user.subjects = user.subjects || [];
      user.subjects.push(subject);
      this.updateLocalStorage();
    }
  }

  removeSubject(email: string, subject: Subject): void {
    const user = this.users.find(user => user.email === email);
    if (user && user.subjects) {
      const index = user.subjects.indexOf(subject);
      if (index > -1) {
        user.subjects.splice(index, 1);
        this.updateLocalStorage();
        console.log('Subject removed:', subject);
      } else {
        console.error('Subject not found for removal:', subject);
      }
    } else {
      console.error('User not found or no subjects to remove');
    }
  }

  

}
