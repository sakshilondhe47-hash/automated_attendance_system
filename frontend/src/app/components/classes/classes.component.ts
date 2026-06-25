import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicClass, ApiService, Department } from '../../services/api.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {
  classes: AcademicClass[] = [];
  departments: Department[] = [];
  searchTerm = '';
  departmentFilter = '';
  form = { name: '', department: '', semester: '', room: '', subjectName: '', teacherName: '', startTime: '' };
  departmentForm = { name: '', code: '' };
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  get filtered(): AcademicClass[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.classes.filter((item) => {
      const matchesTerm = !term || `${item.name} ${item.department} ${item.subjectName} ${item.teacherName} ${item.room}`.toLowerCase().includes(term);
      return matchesTerm && (!this.departmentFilter || item.department === this.departmentFilter);
    });
  }

  load(): void {
    this.api.getClasses().subscribe((data) => this.classes = data);
    this.api.getDepartments().subscribe((data) => this.departments = data);
  }

  addClass(): void {
    this.api.createClass(this.form).subscribe(() => {
      this.form = { name: '', department: '', semester: '', room: '', subjectName: '', teacherName: '', startTime: '' };
      this.message = 'Class saved successfully.';
      this.load();
    });
  }

  addDepartment(): void {
    this.api.createDepartment(this.departmentForm).subscribe(() => {
      this.departmentForm = { name: '', code: '' };
      this.message = 'Department added successfully.';
      this.load();
    });
  }

  deleteClass(item: AcademicClass): void {
    if (!item.id) { return; }
    this.api.deleteClass(item.id).subscribe(() => {
      this.message = 'Class removed.';
      this.load();
    });
  }

  exportCsv(): void {
    const rows = [['Class', 'Department', 'Semester', 'Room', 'Subject', 'Teacher', 'Start Time'], ...this.filtered.map((item) => [item.name, item.department, item.semester, item.room, item.subjectName, item.teacherName, item.startTime])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'classes.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
