import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Teacher } from '../../services/api.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css'
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  searchTerm = '';
  departmentFilter = '';
  page = 1;
  pageSize = 8;
  form = { name: '', department: '', email: '', phone: '', subject: '', className: '' };
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get departments(): string[] { return [...new Set(this.teachers.map((item) => item.department).filter(Boolean))]; }

  get filtered(): Teacher[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.teachers.filter((teacher) => {
      const matchesTerm = !term || `${teacher.name} ${teacher.email} ${teacher.subject} ${teacher.className}`.toLowerCase().includes(term);
      return matchesTerm && (!this.departmentFilter || teacher.department === this.departmentFilter);
    });
  }

  get paged(): Teacher[] {
    return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }

  load(): void { this.api.getTeachers().subscribe((data) => this.teachers = data); }

  addTeacher(): void {
    this.api.createTeacher(this.form).subscribe(() => {
      this.form = { name: '', department: '', email: '', phone: '', subject: '', className: '' };
      this.message = 'Teacher added successfully.';
      this.load();
    });
  }

  deleteTeacher(teacher: Teacher): void {
    if (!teacher.id) { return; }
    this.api.deleteTeacher(teacher.id).subscribe(() => {
      this.message = 'Teacher removed.';
      this.load();
    });
  }

  setPage(page: number): void { this.page = Math.min(Math.max(page, 1), this.totalPages); }

  exportCsv(): void {
    const rows = [['Name', 'Department', 'Email', 'Phone', 'Subject', 'Class'], ...this.filtered.map((teacher) => [teacher.name, teacher.department, teacher.email, teacher.phone, teacher.subject, teacher.className])];
    this.download('teachers.csv', rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n'));
  }

  exportPdf(): void {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { return; }
    win.document.write(`<h1>Teachers Report</h1><table border="1" cellspacing="0" cellpadding="8">${this.filtered.map((teacher) => `<tr><td>${teacher.name}</td><td>${teacher.department}</td><td>${teacher.subject}</td><td>${teacher.className}</td></tr>`).join('')}</table>`);
    win.document.close();
    win.print();
  }

  private download(filename: string, content: string): void {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
