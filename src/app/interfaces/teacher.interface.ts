// src/app/interfaces/teacher.interface.ts
import { Subject } from './subject.interface';
import { Task } from './task.interface'; // Assuming you have a Task interface defined

export interface Teacher {
  isloggedInTeacher: boolean;
  id: string;                    // Unique teacher ID (e.g., TCH123456789)
  name: string;                  // Teacher's full name
  email: string;                 // Teacher's email address
  phone: string;                 // Teacher's phone number
  address: string;               // Teacher's address
  subjects: Subject[];           // Array of subjects teacher can teach
  password: string;              // Auto-generated password for teacher login
  isActive: boolean;             // Whether teacher is currently active
  createdBy: string;             // Admin email who created this teacher
  createdAt: string;             // ISO string of creation date
  totalEarnings?: number;        // Total earnings (optional)
  lastLogin?: string;
  tasks?: Task[];             // Last login date (optional)
}