package com.example.attendance.service;

import com.example.attendance.entity.AttendanceRecord;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.AttendanceRecordRepository;
import com.example.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AttendanceService {
    private final AttendanceRecordRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(
            AttendanceRecordRepository attendanceRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public AttendanceRecord save(AttendanceRecord record) {
        if (record.getStudent() == null || record.getStudent().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Student ID is required");
        }
        Student student = studentRepository.findById(record.getStudent().getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        boolean duplicate = attendanceRepository.existsByStudentIdAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndDate(
                student.getId(), record.getClassName(), record.getSubject(), record.getDate());
        if (duplicate) {
            throw new ResponseStatusException(CONFLICT, "Attendance already recorded for this student and class");
        }
        record.setStudent(student);
        record.setStatus(record.getStatus().toUpperCase());
        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> saveBatch(List<AttendanceRecord> records) {
        for (AttendanceRecord record : records) {
            save(record);
        }
        return records;
    }

    public List<AttendanceRecord> findAll() {
        return attendanceRepository.findAll();
    }

    public List<AttendanceRecord> findByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<AttendanceRecord> findByClassAndDate(String className, LocalDate date) {
        return attendanceRepository.findByClassNameAndDate(className, date);
    }

    public AttendanceRecord update(Long id, AttendanceRecord record) {
        AttendanceRecord existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attendance not found"));
        boolean duplicate = attendanceRepository.existsByStudentIdAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndDateAndIdNot(
                existing.getStudent().getId(), record.getClassName(), record.getSubject(), record.getDate(), id);
        if (duplicate) {
            throw new ResponseStatusException(CONFLICT, "Attendance already recorded for this student and class");
        }
        existing.setStatus(record.getStatus().toUpperCase());
        existing.setClassName(record.getClassName());
        existing.setSubject(record.getSubject());
        existing.setDate(record.getDate());
        return attendanceRepository.save(existing);
    }

    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }

    public AttendanceSummary getSummary(LocalDate date) {
        List<AttendanceRecord> records = attendanceRepository.findByDate(date);
        long present = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        long absent = records.size() - present;
        double percentage = records.isEmpty() ? 0 : (present * 100.0) / records.size();
        return new AttendanceSummary(records.size(), present, absent, percentage);
    }

    public static class AttendanceSummary {
        private final long total;
        private final long present;
        private final long absent;
        private final double percentage;

        public AttendanceSummary(long total, long present, long absent, double percentage) {
            this.total = total;
            this.present = present;
            this.absent = absent;
            this.percentage = percentage;
        }

        public long getTotal() { return total; }
        public long getPresent() { return present; }
        public long getAbsent() { return absent; }
        public double getPercentage() { return percentage; }
    }
}
