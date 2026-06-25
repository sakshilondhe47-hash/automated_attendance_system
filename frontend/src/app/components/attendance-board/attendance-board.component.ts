import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicClass, ApiService, AttendanceRecord, AttendanceSession } from '../../services/api.service';

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
  selectedSession: AttendanceSession = null as unknown as AttendanceSession;
  students: any[] = [];
  classStudents: any[] = [];
  attendance: AttendanceRecord[] = [];
  today = new Date().toISOString().slice(0, 10);
  loading = false;
  statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];
  searchTerm = '';
  message = '';
  saving = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.message = '';
    this.api.getSessionsToday().subscribe({
      next: (data) => {
        // Always fetch classes and merge with today's sessions so UI shows all classes
        this.api.getClasses().subscribe({
          next: (classes) => {
            this.sessions = this.mergeSessionsAndClasses(data || [], classes, this.today);
            this.loading = false;
            if (!this.sessions.length) {
              this.message = 'No classes are available yet. Create a class first to start attendance.';
            }
          },
          error: () => {
            // If classes cannot be loaded, fall back to whatever sessions we have
            this.sessions = data || [];
            this.loading = false;
            if (!this.sessions.length) {
              this.message = 'Unable to load today’s classes. Please confirm the backend is running.';
            }
          }
        });
      },
      error: () => {
        // If sessions endpoint fails, try to load classes and build fallback sessions
        this.api.getClasses().subscribe({
          next: (classes) => {
            this.sessions = this.buildSessionsFromClasses(classes, this.today);
            this.loading = false;
            if (!this.sessions.length) {
              this.message = 'No classes are available yet. Create a class first to start attendance.';
            }
          },
          error: () => {
            this.message = 'Unable to load today’s classes. Please confirm the backend is running.';
            this.loading = false;
          }
        });
      }
    });
  }

  mergeSessionsAndClasses(sessions: AttendanceSession[], classes: AcademicClass[], date: string): AttendanceSession[] {
    const merged: AttendanceSession[] = [];
    const addedClassNames = new Set<string>();

    // Add all existing sessions first
    (sessions || []).forEach((s) => {
      const name = (s.className || '').trim().toLowerCase();
      addedClassNames.add(name);
      merged.push(s);
    });

    // For classes that don't have a session today, create a fallback session
    (classes || []).forEach((cls) => {
      const name = (cls.name || '').trim().toLowerCase();
      if (!addedClassNames.has(name)) {
        const fallback = this.buildSessionsFromClasses([cls], date)[0];
        merged.push(fallback);
      }
    });

    return merged;
  }

  selectSession(session: AttendanceSession): void {
    this.selectedSession = session;
    this.selectedSessionId = session.id ?? null;
    this.loading = true;
    this.message = '';
    this.api.getStudents().subscribe((data) => {
      this.students = data;
      const assigned = this.students.filter((student) => this.sameText(student.assignedClass, session.className));
      this.classStudents = assigned.length ? assigned : this.students;
      this.attendance = this.classStudents.map((student) => ({
        student: { id: student.id, name: student.name, rollNumber: student.rollNumber },
        className: session.className,
        subject: session.subjectName,
        date: session.date || this.today,
        status: 'PRESENT'
      }));
      this.loading = false;
    });
  }

  backToClasses(): void {
    this.selectedSession = null as unknown as AttendanceSession;
    this.selectedSessionId = null;
    this.attendance = [];
    this.classStudents = [];
    this.searchTerm = '';
    this.message = '';
  }

  onSessionChange(): void {
    const selected = this.sessions.find((session) => session.id === Number(this.selectedSessionId));
    if (selected) {
      this.selectSession(selected);
    }
  }

  setStatus(item: AttendanceRecord, status: string): void {
    item.status = status;
  }

  markAll(status: string): void {
    this.attendance.forEach((item) => item.status = status);
  }

  get filteredAttendance(): AttendanceRecord[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.attendance;
    }
    return this.attendance.filter((item) =>
      `${item.student.name || ''} ${item.student.rollNumber || ''}`.toLowerCase().includes(term)
    );
  }

  get exceptionCount(): number {
    return this.attendance.filter((item) => item.status !== 'PRESENT').length;
  }

  get presentCount(): number {
    return this.attendance.filter((item) => item.status === 'PRESENT').length;
  }

  get pendingSessions(): AttendanceSession[] {
    return this.sessions.filter((session) => (session.status || 'PENDING').toUpperCase() !== 'COMPLETED');
  }

  submitAttendance(): void {
    if (!this.selectedSession || !this.attendance.length) { return; }
    this.saving = true;
    this.message = 'Saving attendance...';

    const finalizeSave = (session: AttendanceSession): void => {
      this.api.createAttendanceBulk(this.attendance).subscribe({
        next: () => {
          if (!session.id) {
            this.saving = false;
            this.message = 'Attendance records were saved, but the class session could not be finalized.';
            return;
          }

          this.api.completeSession(session.id).subscribe({
            next: () => {
              this.message = 'Attendance saved successfully.';
              this.saving = false;
              this.backToClasses();
              this.loadSessions();
            },
            error: (error) => {
              this.saving = false;
              this.message = error.status === 409
                ? 'Attendance is already saved for one or more students in this class.'
                : 'Unable to finalize the attendance session. Please try again.';
            }
          });
        },
        error: (error) => {
          this.saving = false;
          this.message = error.status === 409
            ? 'Attendance is already saved for one or more students in this class.'
            : 'Unable to save attendance. Please review the roster and try again.';
        }
      });
    };

    if (this.selectedSession.id) {
      finalizeSave(this.selectedSession);
      return;
    }

    const sessionPayload: AttendanceSession = {
      ...this.selectedSession,
      id: undefined,
      date: this.selectedSession.date || this.today,
      status: 'PENDING'
    };

    this.api.createSession(sessionPayload).subscribe({
      next: (createdSession) => {
        this.selectedSession = createdSession;
        this.selectedSessionId = createdSession.id ?? null;
        finalizeSave(createdSession);
      },
      error: () => {
        this.saving = false;
        this.message = 'Unable to create the class session before saving attendance.';
      }
    });
  }

  buildSessionsFromClasses(classes: AcademicClass[], date: string): AttendanceSession[] {
    return classes.map((cls) => ({
      className: cls.name,
      subjectName: cls.subjectName,
      teacherName: cls.teacherName,
      department: cls.department,
      semester: cls.semester,
      room: cls.room,
      date,
      status: 'PENDING',
      startTime: cls.startTime || '09:00'
    }));
  }

  private sameText(a?: string, b?: string): boolean {
    return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
  }
}
