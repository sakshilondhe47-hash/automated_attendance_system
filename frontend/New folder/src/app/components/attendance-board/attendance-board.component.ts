import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, AttendanceRecord, AttendanceSession } from '../../services/api.service';

@Component({
  selector: 'app-attendance-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-board.component.html',
  styleUrl: './attendance-board.component.css'
})
export class AttendanceBoardComponent implements OnInit {
  sessions: AttendanceSession[] = [];
  selectedSessionId: number | null = null;
  selectedSession: AttendanceSession | null = null;
  students: any[] = [];
  attendance: AttendanceRecord[] = [];
  today = new Date().toISOString().slice(0, 10);
  loading = false;
  statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.api.getSessionsToday().subscribe((data) => {
      this.sessions = data;
      if (this.sessions.length) {
        this.selectSession(this.sessions[0]);
      }
    });
  }

  onSessionChange(): void {
    const selected = this.sessions.find((session) => session.id === Number(this.selectedSessionId));
    if (selected) {
      this.selectSession(selected);
    }
  }

  selectSession(session: AttendanceSession): void {
    this.selectedSession = session;
    this.selectedSessionId = session.id ?? null;
    this.loading = true;
    this.api.getStudents().subscribe((data) => {
      this.students = data;
      this.attendance = this.students.map((student) => ({
        student: { id: student.id, name: student.name, rollNumber: student.rollNumber },
        className: session.className,
        subject: session.subjectName,
        date: this.today,
        status: 'PRESENT'
      }));
      this.loading = false;
    });
  }

  setStatus(item: AttendanceRecord, status: string): void {
    item.status = status;
  }

  submitAttendance(): void {
    if (!this.selectedSessionId) { return; }
    this.api.createAttendanceBulk(this.attendance).subscribe(() => {
      this.api.completeSession(this.selectedSessionId as number).subscribe(() => this.loadSessions());
    });
  }
}
