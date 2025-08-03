export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: Date;
    subjectName?: string; // Optional field to link task to a subject
}