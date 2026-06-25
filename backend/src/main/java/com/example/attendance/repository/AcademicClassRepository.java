package com.example.attendance.repository;

import com.example.attendance.entity.AcademicClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicClassRepository extends JpaRepository<AcademicClass, Long> {
}
