package com.example.attendance.controller;

import com.example.attendance.repository.FacultyRepository;
import com.example.attendance.repository.StudentRepository;
import com.example.attendance.repository.AttendanceRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AttendanceRecordRepository attendanceRepository;

    public DashboardController(
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            AttendanceRecordRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> dashboard() {
        List<com.example.attendance.entity.AttendanceRecord> attendance =
                attendanceRepository.findByDate(LocalDate.now());
        long present = attendance.stream()
                .filter(item -> "PRESENT".equalsIgnoreCase(item.getStatus()))
                .count();
        long absent = attendance.size() - present;
        double percentage = attendance.isEmpty() ? 0 : (present * 100.0) / attendance.size();
        Map<String, Object> response = new HashMap<>();
        response.put("totalStudents", studentRepository.count());
        response.put("totalFaculty", facultyRepository.count());
        response.put("todayAttendance", attendance.size());
        response.put("presentCount", present);
        response.put("absentCount", absent);
        response.put("attendancePercentage", percentage);
        return ResponseEntity.ok(response);
    }
}
