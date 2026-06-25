import { Routes } from '@angular/router';
import { AdminSetupComponent } from './components/admin-setup/admin-setup.component';
import { AttendanceBoardComponent } from './components/attendance-board/attendance-board.component';
import { ClassesComponent } from './components/classes/classes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
import { StudentsComponent } from './components/students/students.component';
import { SubjectsComponent } from './components/subjects/subjects.component';
import { TeachersComponent } from './components/teachers/teachers.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admin', component: AdminSetupComponent },
  { path: 'classes', component: ClassesComponent },
  { path: 'attendance', component: AttendanceBoardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'teachers', component: TeachersComponent },
  { path: 'subjects', component: SubjectsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' }
];
