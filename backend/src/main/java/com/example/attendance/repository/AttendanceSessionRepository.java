package com.example.attendance.repository;

import com.example.attendance.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByDate(LocalDate date);
    List<AttendanceSession> findByStatus(String status);
}
