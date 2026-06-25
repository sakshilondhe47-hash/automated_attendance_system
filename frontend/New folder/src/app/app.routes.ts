import { Routes } from '@angular/router';
import { AdminSetupComponent } from './components/admin-setup/admin-setup.component';
import { AttendanceBoardComponent } from './components/attendance-board/attendance-board.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admin', component: AdminSetupComponent },
  { path: 'attendance', component: AttendanceBoardComponent },
  { path: '**', redirectTo: '' }
];
