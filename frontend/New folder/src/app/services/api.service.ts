import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload { username: string; password: string; }
export interface RegisterPayload { username: string; password: string; email: string; fullName: string; }
export interface Department { id?: number; name: string; code: string; }
export interface AcademicClass { id?: number; name: string; department: string; semester: string; room: string; subjectName: string; teacherName: string; startTime: string; }
export interface SubjectItem { id?: number; name: string; code: string; department: string; }
export interface Teacher { id?: number; name: string; department: string; email: string; phone: string; subject: string; className: string; }
export interface StudentRecord { id?: number; rollNumber: string; name: string; department: string; year: string; email: string; phone: string; assignedClass?: string; }
export interface AttendanceSession { id?: number; className: string; subjectName: string; teacherName: string; department: string; semester: string; room: string; date?: string; status?: string; startTime: string; }
export interface AttendanceRecord { id?: number; student: { id?: number; name?: string; rollNumber?: string; }; className: string; subject: string; date: string; status: string; }
export interface DashboardSummary { totalStudents: number; totalFaculty: number; todayAttendance: number; presentCount: number; absentCount: number; attendancePercentage: number; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`, { headers: this.authHeaders() });
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`, { headers: this.authHeaders() });
  }

  createDepartment(payload: Department): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments`, payload, { headers: this.authHeaders() });
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`, { headers: this.authHeaders() });
  }

  getClasses(): Observable<AcademicClass[]> {
    return this.http.get<AcademicClass[]>(`${this.baseUrl}/classes`, { headers: this.authHeaders() });
  }

  createClass(payload: AcademicClass): Observable<AcademicClass> {
    return this.http.post<AcademicClass>(`${this.baseUrl}/classes`, payload, { headers: this.authHeaders() });
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classes/${id}`, { headers: this.authHeaders() });
  }

  getSubjects(): Observable<SubjectItem[]> {
    return this.http.get<SubjectItem[]>(`${this.baseUrl}/subjects`, { headers: this.authHeaders() });
  }

  createSubject(payload: SubjectItem): Observable<SubjectItem> {
    return this.http.post<SubjectItem>(`${this.baseUrl}/subjects`, payload, { headers: this.authHeaders() });
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subjects/${id}`, { headers: this.authHeaders() });
  }

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/faculties`, { headers: this.authHeaders() });
  }

  createTeacher(payload: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.baseUrl}/faculties`, payload, { headers: this.authHeaders() });
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/faculties/${id}`, { headers: this.authHeaders() });
  }

  getStudents(): Observable<StudentRecord[]> {
    return this.http.get<StudentRecord[]>(`${this.baseUrl}/students`, { headers: this.authHeaders() });
  }

  createStudent(payload: StudentRecord): Observable<StudentRecord> {
    return this.http.post<StudentRecord>(`${this.baseUrl}/students`, payload, { headers: this.authHeaders() });
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${id}`, { headers: this.authHeaders() });
  }

  getSessionsToday(): Observable<AttendanceSession[]> {
    return this.http.get<AttendanceSession[]>(`${this.baseUrl}/sessions/today`, { headers: this.authHeaders() });
  }

  createSession(payload: AttendanceSession): Observable<AttendanceSession> {
    return this.http.post<AttendanceSession>(`${this.baseUrl}/sessions`, payload, { headers: this.authHeaders() });
  }

  completeSession(id: number): Observable<AttendanceSession> {
    return this.http.put<AttendanceSession>(`${this.baseUrl}/sessions/${id}/status?status=COMPLETED`, {}, { headers: this.authHeaders() });
  }

  createAttendanceBulk(payload: AttendanceRecord[]): Observable<AttendanceRecord[]> {
    return this.http.post<AttendanceRecord[]>(`${this.baseUrl}/attendance/bulk`, payload, { headers: this.authHeaders() });
  }

  getAttendanceRecords(date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/attendance/date/${date}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }
}
