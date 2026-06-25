import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, StudentRecord } from '../../services/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: StudentRecord[] = [];
  searchTerm = '';
  departmentFilter = '';
  classFilter = '';
  page = 1;
  pageSize = 8;
  form = { rollNumber: '', name: '', department: '', year: '', email: '', phone: '', assignedClass: '' };
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  get departments(): string[] {
    return [...new Set(this.students.map((student) => student.department).filter(Boolean))];
  }

  get classes(): string[] {
    return [...new Set(this.students.map((student) => student.assignedClass || '').filter(Boolean))];
  }

  get filtered(): StudentRecord[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.students.filter((student) => {
      const matchesTerm = !term || `${student.name} ${student.rollNumber} ${student.email} ${student.phone}`.toLowerCase().includes(term);
      const matchesDepartment = !this.departmentFilter || student.department === this.departmentFilter;
      const matchesClass = !this.classFilter || student.assignedClass === this.classFilter;
      return matchesTerm && matchesDepartment && matchesClass;
    });
  }

  get paged(): StudentRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  load(): void {
    this.api.getStudents().subscribe((data) => this.students = data);
  }

  addStudent(): void {
    this.api.createStudent(this.form).subscribe(() => {
      this.form = { rollNumber: '', name: '', department: '', year: '', email: '', phone: '', assignedClass: '' };
      this.message = 'Student added successfully.';
      this.load();
    });
  }

  deleteStudent(student: StudentRecord): void {
    if (!student.id) { return; }
    this.api.deleteStudent(student.id).subscribe(() => {
      this.message = 'Student removed.';
      this.load();
    });
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(page, 1), this.totalPages);
  }

  exportCsv(): void {
    const rows = this.filtered.map((student) => [student.rollNumber, student.name, student.department, student.year, student.email, student.phone, student.assignedClass || '']);
    this.download('students.csv', this.toCsv([['Roll No', 'Name', 'Department', 'Year', 'Email', 'Phone', 'Class'], ...rows]), 'text/csv');
  }

  exportPdf(): void {
    this.printReport('Students Report', ['Roll No', 'Name', 'Department', 'Class'], this.filtered.map((student) => [student.rollNumber, student.name, student.department, student.assignedClass || '-']));
  }

  private toCsv(rows: string[][]): string {
    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  private download(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private printReport(title: string, headers: string[], rows: string[][]): void {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { return; }
    win.document.write(`<title>${title}</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f1f5f9}</style><h1>${title}</h1><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    win.document.close();
    win.print();
  }
}
