import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicClass, ApiService, AttendanceRecord, AttendanceSession, DashboardSummary, StudentRecord, SubjectItem, Teacher } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  today = new Date().toISOString().slice(0, 10);
  reportDate = this.today;
  summary: DashboardSummary | null = null;
  records: AttendanceRecord[] = [];
  sessions: AttendanceSession[] = [];
  students: StudentRecord[] = [];
  teachers: Teacher[] = [];
  subjects: SubjectItem[] = [];
  classes: AcademicClass[] = [];
  message = '';
  trendBars = [88, 91, 84, 96, 92, 89, 94];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get present(): number { return this.records.filter((record) => record.status === 'PRESENT').length; }
  get absent(): number { return this.records.filter((record) => record.status === 'ABSENT').length; }
  get late(): number { return this.records.filter((record) => record.status === 'LATE').length; }
  get leave(): number { return this.records.filter((record) => record.status === 'LEAVE').length; }
  get completionRate(): number { return this.sessions.length ? Math.round((this.sessions.filter((item) => (item.status || '').toUpperCase() === 'COMPLETED').length / this.sessions.length) * 100) : 0; }

  get classBreakdown(): Array<{ name: string; count: number; rate: number }> {
    return this.classes.slice(0, 8).map((item) => {
      const total = this.records.filter((record) => record.className === item.name).length;
      const present = this.records.filter((record) => record.className === item.name && record.status === 'PRESENT').length;
      return { name: item.name, count: total, rate: total ? Math.round((present / total) * 100) : 0 };
    });
  }

  load(): void {
    // If not logged in, ask user to authenticate instead of silently showing empty data
    const token = localStorage.getItem('token');
    if (!token) {
      this.message = 'Please log in to view reports.';
      this.summary = null;
      this.records = [];
      this.sessions = [];
      this.students = [];
      this.teachers = [];
      this.subjects = [];
      this.classes = [];
      return;
    }

    this.message = '';

    forkJoin({
      summary: this.api.getDashboardSummary().pipe(catchError(() => of(null))),
      records: this.api.getAttendanceRecords(this.reportDate).pipe(catchError(() => of([] as AttendanceRecord[]))),
      sessions: this.api.getSessionsToday().pipe(catchError(() => of([] as AttendanceSession[]))),
      students: this.api.getStudents().pipe(catchError(() => of([] as StudentRecord[]))),
      teachers: this.api.getTeachers().pipe(catchError(() => of([] as Teacher[]))),
      subjects: this.api.getSubjects().pipe(catchError(() => of([] as SubjectItem[]))),
      classes: this.api.getClasses().pipe(catchError(() => of([] as AcademicClass[])))
    }).subscribe((data) => {
      this.summary = data.summary;
      this.records = data.records;
      this.sessions = data.sessions;
      this.students = data.students;
      this.teachers = data.teachers;
      this.subjects = data.subjects;
      this.classes = data.classes;
    });
  }

  exportCsv(): void {
    const rows = [['Student', 'Roll', 'Class', 'Subject', 'Date', 'Status'], ...this.records.map((record) => [record.student?.name || '', record.student?.rollNumber || '', record.className, record.subject, record.date, record.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${this.reportDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    const win = window.open('', '_blank', 'width=1000,height=760');
    if (!win) { return; }
    win.document.write(`<h1>Attendance Analytics - ${this.reportDate}</h1><p>Present: ${this.present} | Absent: ${this.absent} | Late: ${this.late} | Leave: ${this.leave}</p><table border="1" cellspacing="0" cellpadding="8">${this.records.map((record) => `<tr><td>${record.student?.name || ''}</td><td>${record.className}</td><td>${record.subject}</td><td>${record.status}</td></tr>`).join('')}</table>`);
    win.document.close();
    win.print();
  }
}
