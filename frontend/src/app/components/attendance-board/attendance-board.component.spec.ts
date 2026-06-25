import { of } from 'rxjs';
import { AttendanceBoardComponent } from './attendance-board.component';
import { AcademicClass } from '../../services/api.service';

describe('AttendanceBoardComponent', () => {
  it('builds attendance sessions from classes when no sessions are returned for today', () => {
    const api = {
      getSessionsToday: jasmine.createSpy('getSessionsToday').and.returnValue(of([])),
      getClasses: jasmine.createSpy('getClasses').and.returnValue(of([]))
    } as any;

    const component = new AttendanceBoardComponent(api);
    const classes: AcademicClass[] = [
      {
        name: 'BCA 3A',
        department: 'Computer Science',
        semester: '3',
        room: 'Lab 1',
        subjectName: 'Java',
        teacherName: 'Dr. Rao',
        startTime: '09:00'
      }
    ];

    const sessions = component.buildSessionsFromClasses(classes, '2026-06-25');

    expect(sessions.length).toBe(1);
    expect(sessions[0].className).toBe('BCA 3A');
    expect(sessions[0].subjectName).toBe('Java');
    expect(sessions[0].status).toBe('PENDING');
    expect(sessions[0].date).toBe('2026-06-25');
  });
});
