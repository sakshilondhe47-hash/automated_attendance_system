import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, AcademicClass, Department, StudentRecord, SubjectItem, Teacher } from '../../services/api.service';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-setup.component.html',
  styleUrl: './admin-setup.component.css'
})
export class AdminSetupComponent implements OnInit {
  title = 'Admin Setup';
  departments: Department[] = [];
  classes: AcademicClass[] = [];
  subjects: SubjectItem[] = [];
  teachers: Teacher[] = [];
  students: StudentRecord[] = [];

  departmentForm = { name: '', code: '' };
  classForm = { name: '', department: '', semester: '', room: '', subjectName: '', teacherName: '', startTime: '' };
  subjectForm = { name: '', code: '', department: '' };
  teacherForm = { name: '', department: '', email: '', phone: '', subject: '', className: '' };
  studentForm = { rollNumber: '', name: '', department: '', year: '', email: '', phone: '', assignedClass: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get overviewCards(): Array<{ title: string; value: string; detail: string }> {
    return [
      { title: 'Departments', value: this.departments.length.toString(), detail: 'Configured academic units' },
      { title: 'Classes', value: this.classes.length.toString(), detail: 'Active teaching groups' },
      { title: 'Subjects', value: this.subjects.length.toString(), detail: 'Curriculum catalog' },
      { title: 'Students', value: this.students.length.toString(), detail: 'Enrolled learners' }
    ];
  }

  loadAll(): void {
    this.api.getDepartments().subscribe((data) => this.departments = data);
    this.api.getClasses().subscribe((data) => this.classes = data);
    this.api.getSubjects().subscribe((data) => this.subjects = data);
    this.api.getTeachers().subscribe((data) => this.teachers = data);
    this.api.getStudents().subscribe((data) => this.students = data);
  }

  addDepartment(): void {
    this.api.createDepartment(this.departmentForm).subscribe(() => {
      this.departmentForm = { name: '', code: '' };
      this.loadAll();
    });
  }

  addClass(): void {
    this.api.createClass(this.classForm).subscribe(() => {
      this.classForm = { name: '', department: '', semester: '', room: '', subjectName: '', teacherName: '', startTime: '' };
      this.loadAll();
    });
  }

  addSubject(): void {
    this.api.createSubject(this.subjectForm).subscribe(() => {
      this.subjectForm = { name: '', code: '', department: '' };
      this.loadAll();
    });
  }

  addTeacher(): void {
    this.api.createTeacher(this.teacherForm).subscribe(() => {
      this.teacherForm = { name: '', department: '', email: '', phone: '', subject: '', className: '' };
      this.loadAll();
    });
  }

  addStudent(): void {
    this.api.createStudent(this.studentForm).subscribe(() => {
      this.studentForm = { rollNumber: '', name: '', department: '', year: '', email: '', phone: '', assignedClass: '' };
      this.loadAll();
    });
  }
}
