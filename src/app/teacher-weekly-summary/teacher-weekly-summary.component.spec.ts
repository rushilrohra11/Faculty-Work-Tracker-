import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherWeeklySummaryComponent } from './teacher-weekly-summary.component';

describe('TeacherWeeklySummaryComponent', () => {
  let component: TeacherWeeklySummaryComponent;
  let fixture: ComponentFixture<TeacherWeeklySummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherWeeklySummaryComponent]
    });
    fixture = TestBed.createComponent(TeacherWeeklySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
