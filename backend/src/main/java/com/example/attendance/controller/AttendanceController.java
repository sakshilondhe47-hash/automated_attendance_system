package com.example.attendance.controller;

import com.example.attendance.entity.AttendanceRecord;
import com.example.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @PostMapping
    public ResponseEntity<AttendanceRecord> create(@Valid @RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceService.save(record));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceRecord>> createBulk(@Valid @RequestBody List<AttendanceRecord> records) {
        return ResponseEntity.ok(attendanceService.saveBatch(records));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> findAll() {
        return ResponseEntity.ok(attendanceService.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceRecord>> findByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(attendanceService.findByDate(date));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping("/summary/{date}")
    public ResponseEntity<AttendanceService.AttendanceSummary> summary(@PathVariable LocalDate date) {
        return ResponseEntity.ok(attendanceService.getSummary(date));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecord> update(@PathVariable Long id, @Valid @RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceService.update(id, record));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
