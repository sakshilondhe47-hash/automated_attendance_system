package com.example.attendance.service;

import com.example.attendance.entity.AcademicClass;
import com.example.attendance.repository.AcademicClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcademicClassService {
    private final AcademicClassRepository academicClassRepository;

    public AcademicClassService(AcademicClassRepository academicClassRepository) {
        this.academicClassRepository = academicClassRepository;
    }

    public AcademicClass save(AcademicClass academicClass) {
        return academicClassRepository.save(academicClass);
    }

    public List<AcademicClass> findAll() {
        return academicClassRepository.findAll();
    }

    public void delete(Long id) {
        academicClassRepository.deleteById(id);
    }
}
