import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, LoginPayload, RegisterPayload } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Attendance ERP';
  isLoggedIn = false;
  authMode: 'login' | 'register' = 'login';
  showPassword = false;
  form = { username: '', password: '', email: '', fullName: '' };
  message = '';
  navItems = [
    { label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
    { label: 'Attendance', path: '/attendance', icon: 'clipboard-check' },
    { label: 'Students', path: '/students', icon: 'users' },
    { label: 'Teachers', path: '/teachers', icon: 'graduation-cap' },
    { label: 'Subjects', path: '/subjects', icon: 'book-open' },
    { label: 'Classes', path: '/classes', icon: 'school' },
    { label: 'Reports', path: '/reports', icon: 'chart-line' },
    { label: 'Admin setup', path: '/admin', icon: 'settings' }
  ];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    if (this.isLoggedIn) {
      this.router.navigateByUrl('/');
    }
  }

  toggleMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.message = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitAuth(): void {
    const payload: LoginPayload | RegisterPayload = this.authMode === 'login'
      ? { username: this.form.username, password: this.form.password }
      : { username: this.form.username, password: this.form.password, email: this.form.email || '', fullName: this.form.fullName || '' };

    const request = this.authMode === 'login'
      ? this.api.login(payload as LoginPayload)
      : this.api.register(payload as RegisterPayload);

    request.subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('role', res.role);
        this.isLoggedIn = true;
        this.message = this.authMode === 'login' ? 'Login successful.' : 'Registration successful.';
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.message = error.status === 409
          ? 'That username is already registered.'
          : 'Authentication failed. Check your credentials and form values.';
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedIn = false;
    this.message = 'You have been logged out.';
    this.router.navigateByUrl('/');
  }
}
