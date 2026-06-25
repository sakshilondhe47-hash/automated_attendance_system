package com.example.attendance.controller;

import com.example.attendance.entity.AttendanceSession;
import com.example.attendance.service.AttendanceSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class AttendanceSessionController {
    private final AttendanceSessionService attendanceSessionService;

    public AttendanceSessionController(AttendanceSessionService attendanceSessionService) {
        this.attendanceSessionService = attendanceSessionService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping
    public ResponseEntity<List<AttendanceSession>> findAll() {
        return ResponseEntity.ok(attendanceSessionService.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping("/today")
    public ResponseEntity<List<AttendanceSession>> today() {
        return ResponseEntity.ok(attendanceSessionService.findByDate(LocalDate.now()));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @PostMapping
    public ResponseEntity<AttendanceSession> create(@RequestBody AttendanceSession session) {
        session.setDate(LocalDate.now());
        return ResponseEntity.ok(attendanceSessionService.save(session));
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @PutMapping("/{id}/status")
    public ResponseEntity<AttendanceSession> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(attendanceSessionService.updateStatus(id, status));
    }
}
