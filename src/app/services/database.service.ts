import { Injectable } from '@angular/core';
import { Subject } from '../interfaces/subject.interface';
import { Teacher } from '../interfaces/teacher.interface';
import { Task } from '../interfaces/task.interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly USERS_KEY = 'registeredUsers';
  private readonly SUBJECTS_KEY = 'subjects';
  private readonly TEACHERS_KEY = 'teachers';
  
  private users: any[] = [];
  private teachers: Teacher[] = [];

  isloggedInAdmin: boolean = false;
  isloggedInAdminEmail: string = '';

  isloggedInTeacher: any = false;
  isloggedInTeacheremail: string = '';

  subjects: Subject[] = [];

  constructor() {
    this.loadUsersFromStorage();
    this.loadTeachersFromStorage();
    this.restoreAdminLoginState();
     // Restore admin login state on service initialization
  }

  
  /** Load users from localStorage at startup */
  private loadUsersFromStorage(): void {
    const data = localStorage.getItem(this.USERS_KEY);
    this.users = data ? JSON.parse(data) : [];
  }

  /** Load teachers from localStorage at startup */
  private loadTeachersFromStorage(): void {
    const data = localStorage.getItem(this.TEACHERS_KEY);
    this.teachers = data ? JSON.parse(data) : [];
    
  }

  /** Save the current user list to localStorage */
  private updateLocalStorage(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  /** Save the current teachers list to localStorage */
  private updateTeachersLocalStorage(): void {
    localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(this.teachers));
  }

  /** Save subjects to localStorage */
  private updateSubjectsLocalStorage(): void {
    localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(this.subjects));
  }

  // ...existing code...

/** Get tasks for a specific teacher */
getTasksForTeacher(email: string): Task[] {
  const teacher = this.teachers.find(t => t.email === email);
  return teacher && teacher.tasks ? [...teacher.tasks] : [];
}

/** Add a task for a specific teacher */
addTaskForTeacher(email: string, task: Task): void {
  const teacher = this.teachers.find(t => t.email === email);
  if (teacher) {
    if (!teacher.tasks) teacher.tasks = [];
    teacher.tasks.push(task);
    this.updateTeachersLocalStorage();
  }
}

/** Remove a task for a specific teacher */
removeTaskForTeacher(email: string, taskId: string): void {
  const teacher = this.teachers.find(t => t.email === email);
  if (teacher && teacher.tasks) {
    teacher.tasks = teacher.tasks.filter(task => task.id !== taskId);
    this.updateTeachersLocalStorage();
  }
}

/** Update a task for a specific teacher */
updateTaskForTeacher(email: string, updatedTask: Task): void {
  const teacher = this.teachers.find(t => t.email === email);
  if (teacher && teacher.tasks) {
    const idx = teacher.tasks.findIndex(task => task.id === updatedTask.id);
    if (idx !== -1) {
      teacher.tasks[idx] = updatedTask;
      this.updateTeachersLocalStorage();
    }
  }
}

  

  loadData(): void {
    this.users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    this.subjects = JSON.parse(localStorage.getItem(this.SUBJECTS_KEY) || '[]');
    this.teachers = JSON.parse(localStorage.getItem(this.TEACHERS_KEY) || '[]');
    console.log('Data loaded from localStorage:', {
      users: this.users.length,
      subjects: this.subjects.length,
      teachers: this.teachers.length
    });
  }

  loadSubjectsForAdmin(): Subject[] {
    this.subjects = JSON.parse(localStorage.getItem(this.SUBJECTS_KEY) || '[]');
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

  /** Get teachers from internal state */
  getTeachers(): Teacher[] {
    try {
      return [...this.teachers]; // return a copy to avoid mutation
    } catch (error) {
      console.error('Error getting teachers:', error);
      return [];
    }
  }

  /** Clear all users */
  clearUsers(): void {
    this.users = [];
    this.updateLocalStorage();
    console.log('All users cleared');
  }

  getLoggedInTeacherEmail(): string | null {
    return this.isloggedInTeacheremail || null;
  }



  // ==================== ADMIN AUTHENTICATION METHODS ====================
  
  /** Check if current user is admin */
  isCurrentUserAdmin(): boolean {
    return this.isloggedInAdmin;
  }

  /** Get current admin email */
  getCurrentAdminEmail(): string {
    return this.isloggedInAdminEmail;
  }

  /** Get admin user details */
  getCurrentAdminUser(): any {
    return this.users.find(user => 
      user.email === this.isloggedInAdminEmail && 
      user.isAdmin === true
    );
  }

  /** Set admin login status and persist to localStorage with user data */
  setAdminLoginStatus(isLoggedIn: boolean, email: string = '', userData: any = null): void {
    this.isloggedInAdmin = isLoggedIn;
    this.isloggedInAdminEmail = email;
    
    // Persist login state to localStorage
    if (isLoggedIn && userData) {
      // Store admin login status
      localStorage.setItem('isLoggedInAdmin', 'true');
      localStorage.setItem('loggedInAdminEmail', email);
      
      // Store complete user data
      localStorage.setItem('currentAdminUser', JSON.stringify(userData));
      
      // Update user in users array and save to localStorage
      const userIndex = this.users.findIndex(u => u.email === email);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.updateLocalStorage();
      }
      
      console.log('Admin logged in and data stored:', email);
    } else {
      // Clear all admin data from localStorage
      localStorage.removeItem('isLoggedInAdmin');
      localStorage.removeItem('loggedInAdminEmail');
      localStorage.removeItem('currentAdminUser');
      console.log('Admin logged out and data cleared');
    }
    
    console.log('Admin login status updated:', { isLoggedIn, email });
  }

  /** Restore admin login state from localStorage on service initialization */
  private restoreAdminLoginState(): void {
    const isLoggedIn = localStorage.getItem('isLoggedInAdmin') === 'true';
    const adminEmail = localStorage.getItem('loggedInAdminEmail') || '';
    const storedUserData = localStorage.getItem('currentAdminUser');
    
    if (isLoggedIn && adminEmail && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        
        // Verify the admin user still exists in users array
        const adminUser = this.users.find(user => 
          user.email === adminEmail && user.isAdmin === true
        );
        
        if (adminUser) {
          // Restore login state
          this.isloggedInAdmin = true;
          this.isloggedInAdminEmail = adminEmail;
          
          // Update user's login status in the array
          adminUser.isLoggedInAdmin = true;
          this.updateLocalStorage();
          
          console.log('Admin login state restored:', adminEmail);
        } else {
          // Clear invalid login state
          this.clearAdminLoginState();
          console.log('Invalid admin login state cleared - user not found');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAdminLoginState();
      }
    }
  }

  /** Clear admin login state */
  private clearAdminLoginState(): void {
    this.isloggedInAdmin = false;
    this.isloggedInAdminEmail = '';
    localStorage.removeItem('isLoggedInAdmin');
    localStorage.removeItem('loggedInAdminEmail');
    localStorage.removeItem('currentAdminUser');
  }

  /** Validate admin credentials */
  validateAdminCredentials(email: string, password: string): boolean {
    const adminUser = this.users.find(user => 
      user.email === email && 
      user.password === password && 
      user.isAdmin === true
    );
    
    return !!adminUser;
  }

  /** Login admin user */
  loginAdmin(email: string, password: string): boolean {
    if (this.validateAdminCredentials(email, password)) {
      const adminUser = this.users.find(user => 
        user.email === email && user.isAdmin === true
      );
      
      if (adminUser) {
        // Update user's login status
        adminUser.isLoggedInAdmin = true;
        adminUser.lastLoginTime = new Date().toISOString();
        
        // Set admin login status with user data
        this.setAdminLoginStatus(true, email, adminUser);
        return true;
      }
    }
    return false;
  }

  /** Logout admin user */
  logoutAdmin(): void {
    // Update current admin user's login status
    const currentUser = this.getCurrentAdminUser();
    if (currentUser) {
      currentUser.isLoggedInAdmin = false;
      currentUser.lastLogoutTime = new Date().toISOString();
      this.updateLocalStorage();
    }
    
    this.setAdminLoginStatus(false, '', null);
  }

  /** Check if admin session is valid */
  isAdminSessionValid(): boolean {
    if (!this.isloggedInAdmin || !this.isloggedInAdminEmail) {
      return false;
    }
    
    // Check if admin user still exists
    const adminUser = this.getCurrentAdminUser();
    return !!adminUser;
  }

  /** Get admin login time (if you want to track session duration) */
  getAdminLoginTime(): string | null {
    return localStorage.getItem('adminLoginTime');
  }

  /** Set admin login time */
  private setAdminLoginTime(): void {
    localStorage.setItem('adminLoginTime', new Date().toISOString());
  }

  /** Update user login status in users array */
  updateUserLoginStatus(user: any): void {
    const userIndex = this.users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...user };
      this.updateLocalStorage();
      console.log('User login status updated:', user.email);
    }
  }

  /** Get stored admin user data from localStorage */
  getStoredAdminUser(): any {
    try {
      const storedData = localStorage.getItem('currentAdminUser');
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error getting stored admin user:', error);
      return null;
    }
  }

  /** Update stored admin user data in localStorage */
  updateStoredAdminUser(userData: any): void {
    try {
      localStorage.setItem('currentAdminUser', JSON.stringify(userData));
      console.log('Stored admin user data updated');
    } catch (error) {
      console.error('Error updating stored admin user:', error);
    }
  }

  /** Check if user is currently logged in admin */
  isUserLoggedInAdmin(email: string): boolean {
    const user = this.users.find(u => u.email === email);
    return user ? (user.isLoggedInAdmin === true) : false;
  }

  /** Add new teacher and persist it */
  addTeacher(teacher: Teacher): void {
    try {
      // ...existing checks...
      teacher.tasks = []; // Initialize tasks array
      this.teachers.push(teacher);
      this.updateTeachersLocalStorage();
      console.log('Teacher added successfully:', teacher.name);
    } catch (error) {
      console.error('Error adding teacher:', error);
      throw error;
    }
  }

  /** Get teacher by ID */
  getTeacherById(teacherId: string): Teacher | null {
    try {
      return this.teachers.find(teacher => teacher.id === teacherId) || null;
    } catch (error) {
      console.error('Error getting teacher by ID:', error);
      return null;
    }
  }

  /** Validate teacher credentials for login */
  getTeacherByCredentials(teacherId: string, password: string): Teacher | null {
    try {
      return this.teachers.find(teacher => 
        teacher.id === teacherId && 
        teacher.password === password && 
        teacher.isActive
      ) || null;
    } catch (error) {
      console.error('Error validating teacher credentials:', error);
      return null;
    }
  }

  /** Update existing teacher */
  updateTeacher(updatedTeacher: Teacher): void {
    try {
      const index = this.teachers.findIndex(teacher => teacher.id === updatedTeacher.id);
      
      if (index !== -1) {
        this.teachers[index] = { ...updatedTeacher };
        this.updateTeachersLocalStorage();
        console.log('Teacher updated successfully:', updatedTeacher.name);
      } else {
        throw new Error('Teacher not found');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }

  /** Remove teacher by ID */
  removeTeacher(teacherId: string): void {
    try {
      const initialLength = this.teachers.length;
      this.teachers = this.teachers.filter(teacher => teacher.id !== teacherId);
      
      if (this.teachers.length < initialLength) {
        this.updateTeachersLocalStorage();
        console.log('Teacher removed successfully');
      } else {
        throw new Error('Teacher not found');
      }
    } catch (error) {
      console.error('Error removing teacher:', error);
      throw error;
    }
  }

  /** Get teachers by subject */
  getTeachersBySubject(subjectName: string): Teacher[] {
    try {
      return this.teachers.filter(teacher => 
        teacher.isActive && 
        teacher.subjects.some(subject => subject.subjectName === subjectName)
      );
    } catch (error) {
      console.error('Error getting teachers by subject:', error);
      return [];
    }
  }


/** Save all teachers' tasks to localStorage */


/** Get tasks for a specific teacher */

  /** Update teacher's last login */
  updateTeacherLastLogin(teacherId: string): void {
    try {
      const teacher = this.getTeacherById(teacherId);
      if (teacher) {
        teacher.lastLogin = new Date().toISOString();
        this.updateTeacher(teacher);
        console.log('Teacher last login updated:', teacherId);
      }
    } catch (error) {
      console.error('Error updating teacher last login:', error);
    }
  }

  /** Get only active teachers */
  getActiveTeachers(): Teacher[] {
    try {
      return this.teachers.filter(teacher => teacher.isActive);
    } catch (error) {
      console.error('Error getting active teachers:', error);
      return [];
    }
  }

  /** Search teachers by name, email, or ID */
  searchTeachers(searchTerm: string): Teacher[] {
    try {
      const term = searchTerm.toLowerCase();
      
      return this.teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term) ||
        teacher.id.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching teachers:', error);
      return [];
    }
  }

  /** Toggle teacher active status */
  toggleTeacherStatus(teacherId: string): boolean {
    try {
      const teacher = this.getTeacherById(teacherId);
      if (teacher) {
        teacher.isActive = !teacher.isActive;
        this.updateTeacher(teacher);
        console.log(`Teacher ${teacher.name} ${teacher.isActive ? 'activated' : 'deactivated'}`);
        return teacher.isActive;
      }
      return false;
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      return false;
    }
  }

  /** Update teacher earnings */
  updateTeacherEarnings(teacherId: string, amount: number): void {
    try {
      const teacher = this.getTeacherById(teacherId);
      if (teacher) {
        teacher.totalEarnings = (teacher.totalEarnings || 0) + amount;
        this.updateTeacher(teacher);
        console.log(`Teacher ${teacher.name} earnings updated by $${amount}`);
      }
    } catch (error) {
      console.error('Error updating teacher earnings:', error);
    }
  }

  /** Get teachers created by specific admin */
  getTeachersByAdmin(adminEmail: string): Teacher[] {
    try {
      return this.teachers.filter(teacher => teacher.createdBy === adminEmail);
    } catch (error) {
      console.error('Error getting teachers by admin:', error);
      return [];
    }
  }

  /** Get teacher statistics */
  getTeacherStats(): {
    total: number;
    active: number;
    inactive: number;
    totalEarnings: number;
  } {
    try {
      const total = this.teachers.length;
      const active = this.teachers.filter(t => t.isActive).length;
      const inactive = total - active;
      const totalEarnings = this.teachers.reduce((sum, teacher) => 
        sum + (teacher.totalEarnings || 0), 0
      );

      return { total, active, inactive, totalEarnings };
    } catch (error) {
      console.error('Error getting teacher stats:', error);
      return { total: 0, active: 0, inactive: 0, totalEarnings: 0 };
    }
  }

  /** Clear all teachers (for admin use) */
  clearAllTeachers(): void {
    try {
      this.teachers = [];
      this.updateTeachersLocalStorage();
      console.log('All teachers cleared');
    } catch (error) {
      console.error('Error clearing teachers:', error);
    }
  }

  /** Bulk update teachers */
  bulkUpdateTeachers(updates: { teacherId: string; updates: Partial<Teacher> }[]): void {
    try {
      updates.forEach(({ teacherId, updates: teacherUpdates }) => {
        const teacher = this.getTeacherById(teacherId);
        if (teacher) {
          Object.assign(teacher, teacherUpdates);
        }
      });
      
      this.updateTeachersLocalStorage();
      console.log('Bulk teacher updates completed');
    } catch (error) {
      console.error('Error in bulk teacher updates:', error);
    }
  }

  /** Export teachers data (for backup/export functionality) */
  exportTeachersData(): string {
    try {
      return JSON.stringify(this.teachers, null, 2);
    } catch (error) {
      console.error('Error exporting teachers data:', error);
      return '[]';
    }
  }

  /** Import teachers data (for restore/import functionality) */
  importTeachersData(jsonData: string): boolean {
    try {
      const importedTeachers = JSON.parse(jsonData);
      
      // Validate the imported data structure
      if (Array.isArray(importedTeachers)) {
        this.teachers = importedTeachers;
        this.updateTeachersLocalStorage();
        console.log('Teachers data imported successfully');
        return true;
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error importing teachers data:', error);
      return false;
    }
  }

  // Updated addSubject method for DatabaseService

addSubject(email: string, subject: Subject): void {
  try {
    // Add to global subjects array
    this.subjects.push(subject);
    this.updateSubjectsLocalStorage();
    console.log('Subject added to global subjects:', subject);
    
    // Find and update the admin user in the users array
    const adminUserIndex = this.users.findIndex(user => 
      user.email === email && 
      user.isAdmin === true
    );
    
    if (adminUserIndex !== -1) {
      // Initialize subjects array if it doesn't exist
      if (!this.users[adminUserIndex].subjects) {
        this.users[adminUserIndex].subjects = [];
      }
      
      // Add subject to admin user's subjects
      this.users[adminUserIndex].subjects.push(subject);
      
      // Update localStorage with the modified users array
      this.updateLocalStorage();
      
      // Also update the stored admin user data if this is the current logged-in admin
      if (email === this.isloggedInAdminEmail) {
        this.updateStoredAdminUser(this.users[adminUserIndex]);
      }
      
      console.log('Subject added to admin user successfully:', {
        email: email,
        subject: subject,
        totalSubjects: this.users[adminUserIndex].subjects.length
      });
    } else {
      console.error('Admin user not found with email:', email);
      throw new Error('Admin user not found');
    }
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
}

// Updated removeSubject method for consistency
removeSubject(email: string, subject: Subject): void {
  try {
    // Remove from global subjects array
    const globalIndex = this.subjects.findIndex(s => 
      s.subjectName === subject.subjectName && s.payPerHour === subject.payPerHour
    );
    
    if (globalIndex > -1) {
      this.subjects.splice(globalIndex, 1);
      this.updateSubjectsLocalStorage();
      console.log('Subject removed from global subjects');
    }

    // Find and update the admin user in the users array
    const adminUserIndex = this.users.findIndex(user => 
      user.email === email && 
      user.isAdmin === true
    );
    
    if (adminUserIndex !== -1 && this.users[adminUserIndex].subjects) {
      const subjectIndex = this.users[adminUserIndex].subjects.findIndex((s: Subject) => 
        s.subjectName === subject.subjectName && s.payPerHour === subject.payPerHour
      );
      
      if (subjectIndex > -1) {
        this.users[adminUserIndex].subjects.splice(subjectIndex, 1);
        
        // Update localStorage with the modified users array
        this.updateLocalStorage();
        
        // Also update the stored admin user data if this is the current logged-in admin
        if (email === this.isloggedInAdminEmail) {
          this.updateStoredAdminUser(this.users[adminUserIndex]);
        }
        
        console.log('Subject removed from admin user successfully:', {
          email: email,
          subject: subject,
          remainingSubjects: this.users[adminUserIndex].subjects.length
        });
      } else {
        console.error('Subject not found in admin user subjects:', subject);
      }
    } else {
      console.error('Admin user not found or no subjects array:', email);
    }
  } catch (error) {
    console.error('Error removing subject:', error);
    throw error;
  }
}

// Helper method to verify subject was added correctly
verifySubjectAddition(email: string, subject: Subject): boolean {
  try {
    const adminUser = this.users.find(user => 
      user.email === email && user.isAdmin === true
    );
    
    if (adminUser && adminUser.subjects) {
      return adminUser.subjects.some((s: Subject) => 
        s.subjectName === subject.subjectName && s.payPerHour === subject.payPerHour
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying subject addition:', error);
    return false;
  }
}

  
}