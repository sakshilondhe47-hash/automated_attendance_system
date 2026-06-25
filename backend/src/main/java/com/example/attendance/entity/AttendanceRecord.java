package com.example.attendance.entity;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attendance_student_class_subject_date",
                columnNames = {"student_id", "class_name", "subject", "date"}
        )
)
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @NotNull
    @Valid
    private Student student;

    @Column(name = "class_name", nullable = false)
    @NotBlank
    private String className;

    @Column(nullable = false)
    @NotBlank
    private String subject;

    @Column(name = "date", nullable = false)
    @NotNull
    private LocalDate date;

    @Column(nullable = false)
    @NotBlank
    @Pattern(regexp = "PRESENT|ABSENT|LATE|LEAVE", message = "status must be PRESENT, ABSENT, LATE or LEAVE")
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
