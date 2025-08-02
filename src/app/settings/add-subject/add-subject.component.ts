import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'src/app/interfaces/subject.interface';
@Component({
  selector: 'app-add-subject',
  templateUrl: './add-subject.component.html',
  styleUrls: ['./add-subject.component.css']
})
export class AddSubjectComponent {

  addSubjectForm!: FormGroup;
  subjects: Subject[] = [];

  constructor(private database: DatabaseService, private fb: DatabaseService) {}

  ngOnInit(): void {
    // Initialization logic can go here
    this.addSubjectForm = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2)]],
      payPerHour: [0, [Validators.required, Validators.min(1)]]
    });

    loadSubjects();
  }

  loadSubjects(): void {
    this.subjects = this.database.lo();
  }

  isLoggedInAdmin: boolean = this.database.isloggedInAdmin;
  isLoggedInAdminEmail: string = this.database.isloggedInAdminEmail;
  email: string = this.database.getUsers().find(user => user.isLoggedInAdmin)?.email || '';

  // Removed duplicate addSubjectForm and ngOnInit()

  onAddSubject(): void {
    if(this.isLoggedInAdmin) {
      const subjectName = (document.getElementById('subjectName') as HTMLInputElement).value;
      const payPerHour = this.addSubjectForm.get('payPerHour')?.value;
      const subject: Subject = {
        subjectName: subjectName,
        payPerHour: payPerHour
      };
      if (subject) {
        console.log('Subject added:', subjectName);
        this.database.addUser({ email: this.email, subject: subject });
        // Optionally, you can clear the input field after adding
        (document.getElementById('subjectName') as HTMLInputElement).value = '';
      } else {
        console.error('Subject name cannot be empty');
      }
    }
  }

  deleteSubject(subject: Subject): void {
    if (this.isLoggedInAdmin) {
      this.database.removeSubject(this.email, subject);
      console.log('Subject deleted:', subject.subjectName);
    }
  }
    

}
