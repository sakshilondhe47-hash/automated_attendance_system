import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, SubjectItem } from '../../services/api.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {
  subjects: SubjectItem[] = [];
  searchTerm = '';
  departmentFilter = '';
  form = { name: '', code: '', department: '' };
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get departments(): string[] { return [...new Set(this.subjects.map((item) => item.department).filter(Boolean))]; }

  get filtered(): SubjectItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.subjects.filter((subject) => {
      const matchesTerm = !term || `${subject.name} ${subject.code} ${subject.department}`.toLowerCase().includes(term);
      return matchesTerm && (!this.departmentFilter || subject.department === this.departmentFilter);
    });
  }

  load(): void { this.api.getSubjects().subscribe((data) => this.subjects = data); }

  addSubject(): void {
    this.api.createSubject(this.form).subscribe(() => {
      this.form = { name: '', code: '', department: '' };
      this.message = 'Subject added successfully.';
      this.load();
    });
  }

  deleteSubject(subject: SubjectItem): void {
    if (!subject.id) { return; }
    this.api.deleteSubject(subject.id).subscribe(() => {
      this.message = 'Subject removed.';
      this.load();
    });
  }

  exportCsv(): void {
    const rows = [['Code', 'Subject', 'Department'], ...this.filtered.map((subject) => [subject.code, subject.name, subject.department])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subjects.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { return; }
    win.document.write(`<h1>Subjects Report</h1><table border="1" cellspacing="0" cellpadding="8">${this.filtered.map((subject) => `<tr><td>${subject.code}</td><td>${subject.name}</td><td>${subject.department}</td></tr>`).join('')}</table>`);
    win.document.close();
    win.print();
  }
}
