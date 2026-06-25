package com.example.attendance.service;

import com.example.attendance.entity.AttendanceSession;
import com.example.attendance.repository.AttendanceSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceSessionService {
    private final AttendanceSessionRepository attendanceSessionRepository;

    public AttendanceSessionService(AttendanceSessionRepository attendanceSessionRepository) {
        this.attendanceSessionRepository = attendanceSessionRepository;
    }

    public AttendanceSession save(AttendanceSession session) {
        return attendanceSessionRepository.save(session);
    }

    public List<AttendanceSession> findAll() {
        return attendanceSessionRepository.findAll();
    }

    public List<AttendanceSession> findByDate(LocalDate date) {
        return attendanceSessionRepository.findByDate(date);
    }

    public List<AttendanceSession> findPending() {
        return attendanceSessionRepository.findByStatus("PENDING");
    }

    public AttendanceSession updateStatus(Long id, String status) {
        AttendanceSession session = attendanceSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance session not found"));
        session.setStatus(status);
        return attendanceSessionRepository.save(session);
    }
}
