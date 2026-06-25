package com.example.attendance.repository;

import com.example.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByDate(LocalDate date);
    List<AttendanceRecord> findByClassNameAndDate(String className, LocalDate date);
    List<AttendanceRecord> findBySubjectAndDate(String subject, LocalDate date);
    boolean existsByStudentIdAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndDate(
            Long studentId, String className, String subject, LocalDate date);
    boolean existsByStudentIdAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndDateAndIdNot(
            Long studentId, String className, String subject, LocalDate date, Long id);
}
