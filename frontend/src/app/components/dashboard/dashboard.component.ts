import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicClass, ApiService, AttendanceRecord, AttendanceSession, DashboardSummary, StudentRecord, SubjectItem, Teacher } from '../../services/api.service';

interface StatCard {
  label: string;
  value: string | number;
  detail: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}

interface ActivityItem {
  title: string;
  detail: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary = {
    totalStudents: 0,
    totalFaculty: 0,
    todayAttendance: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0
  };
  insights: Array<{ title: string; value: string; detail: string }> = [];
  todaySessions: AttendanceSession[] = [];
  classes: AcademicClass[] = [];
  subjects: SubjectItem[] = [];
  teachers: Teacher[] = [];
  students: StudentRecord[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  loading = true;
  today = new Date().toISOString().slice(0, 10);
  username = localStorage.getItem('username') || 'Faculty';

  announcements = [
    { title: 'Morning attendance window', detail: 'Faculty can complete all scheduled classes directly from Today’s Classes.' },
    { title: 'Roster hygiene', detail: 'Keep assigned classes updated so attendance rosters load automatically.' },
    { title: 'ERP audit mode', detail: 'Reports now summarize class, subject, and daily attendance coverage.' }
  ];

  quickActions = [
    { label: 'Start attendance', path: '/attendance', detail: 'Open today’s auto-loaded classes' },
    { label: 'Manage students', path: '/students', detail: 'Search, export, and maintain rosters' },
    { label: 'View reports', path: '/reports', detail: 'Analyze trends and completion health' }
  ];

  trendBars = [
    { label: 'Mon', value: 92 },
    { label: 'Tue', value: 88 },
    { label: 'Wed', value: 94 },
    { label: 'Thu', value: 91 },
    { label: 'Fri', value: 96 },
    { label: 'Sat', value: 84 }
  ];

  calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

  recentActivity: ActivityItem[] = [
    { title: 'Dashboard initialized', detail: 'Live ERP workspace prepared for attendance operations.', time: 'Now' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get statCards(): StatCard[] {
    return [
      { label: 'Students', value: this.summary?.totalStudents ?? this.students.length, detail: 'Registered learners', tone: 'blue' },
      { label: 'Faculty', value: this.summary?.totalFaculty ?? this.teachers.length, detail: 'Active instructors', tone: 'violet' },
      { label: 'Today’s sessions', value: this.todaySessions.length, detail: `${this.pendingSessions.length} pending`, tone: 'amber' },
      { label: 'Attendance rate', value: `${this.round(this.summary?.attendancePercentage ?? 0)}%`, detail: `${this.summary?.presentCount ?? 0} present today`, tone: 'green' }
    ];
  }

  get pendingSessions(): AttendanceSession[] {
    return this.todaySessions.filter((session) => (session.status || 'PENDING').toUpperCase() !== 'COMPLETED');
  }

  get completedSessions(): AttendanceSession[] {
    return this.todaySessions.filter((session) => (session.status || '').toUpperCase() === 'COMPLETED');
  }

  get attendanceMix(): Array<{ label: string; value: number; className: string }> {
    const present = this.summary?.presentCount ?? 0;
    const absent = this.summary?.absentCount ?? 0;
    const total = Math.max(present + absent, 1);
    return [
      { label: 'Present', value: Math.round((present / total) * 100), className: 'present' },
      { label: 'Exceptions', value: Math.round((absent / total) * 100), className: 'absent' }
    ];
  }

  loadDashboard(): void {
    forkJoin({
      summary: this.api.getDashboardSummary().pipe(catchError(() => of(null))),
      sessions: this.api.getSessionsToday().pipe(catchError(() => of([] as AttendanceSession[]))),
      classes: this.api.getClasses().pipe(catchError(() => of([] as AcademicClass[]))),
      subjects: this.api.getSubjects().pipe(catchError(() => of([] as SubjectItem[]))),
      teachers: this.api.getTeachers().pipe(catchError(() => of([] as Teacher[]))),
      students: this.api.getStudents().pipe(catchError(() => of([] as StudentRecord[]))),
      attendance: this.api.getAttendanceRecords(this.today).pipe(catchError(() => of([] as AttendanceRecord[])))
    }).subscribe((data) => {
      this.summary = data.summary ?? this.summary;
      this.todaySessions = data.sessions;
      this.classes = data.classes;
      this.subjects = data.subjects;
      this.teachers = data.teachers;
      this.students = data.students;
      this.attendanceRecords = data.attendance;
      this.recentActivity = this.buildActivity();
      this.loading = false;
    });
  }

  rosterCount(session: AttendanceSession): number {
    const matched = this.students.filter((student) => this.sameText(student.assignedClass, session.className));
    return matched.length || this.students.length;
  }

  private buildActivity(): ActivityItem[] {
    const sessionItems = this.todaySessions.slice(0, 3).map((session) => ({
      title: `${session.className} • ${session.subjectName}`,
      detail: `${session.teacherName} at ${session.startTime || 'scheduled time'} • ${session.status || 'PENDING'}`,
      time: 'Today'
    }));

    const recordItems = this.attendanceRecords.slice(0, 2).map((record) => ({
      title: `${record.student?.name || 'Student'} marked ${record.status}`,
      detail: `${record.className} • ${record.subject}`,
      time: record.date
    }));

    return [...sessionItems, ...recordItems].length
      ? [...sessionItems, ...recordItems]
      : [{ title: 'No activity yet', detail: 'Start attendance to build today’s audit trail.', time: 'Today' }];
  }

  private sameText(a?: string, b?: string): boolean {
    return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
  }

  private round(value: number): number {
    return Math.round(value);
  }
}
