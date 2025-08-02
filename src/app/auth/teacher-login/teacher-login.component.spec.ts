import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TeacherLoginComponent } from './teacher-login.component';

describe('TeacherLoginComponent', () => {
  let component: TeacherLoginComponent;
  let fixture: ComponentFixture<TeacherLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherLoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    const initial = component.showPassword;
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(!initial);
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.isLoading).toBeFalse();
  });

  it('should display error for incorrect credentials', () => {
    component.loginForm.setValue({ email: 'wrong@teacher.com', password: 'wrongpass' });
    component.onSubmit();
    setTimeout(() => {
      expect(component.loginError).toBe('Invalid email or password');
    }, 1600);
  });
});
