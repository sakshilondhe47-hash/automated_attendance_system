package com.example.attendance.repository;

import com.example.attendance.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    List<Faculty> findByNameContainingIgnoreCase(String name);
    List<Faculty> findByDepartmentContainingIgnoreCase(String department);
}
