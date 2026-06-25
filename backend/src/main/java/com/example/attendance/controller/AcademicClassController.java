package com.example.attendance.controller;

import com.example.attendance.entity.AcademicClass;
import com.example.attendance.service.AcademicClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class AcademicClassController {
    private final AcademicClassService academicClassService;

    public AcademicClassController(AcademicClassService academicClassService) {
        this.academicClassService = academicClassService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    @GetMapping
    public ResponseEntity<List<AcademicClass>> findAll() {
        return ResponseEntity.ok(academicClassService.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AcademicClass> create(@RequestBody AcademicClass academicClass) {
        return ResponseEntity.ok(academicClassService.save(academicClass));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        academicClassService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
