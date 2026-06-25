package com.example.attendance.service;

import com.example.attendance.entity.Student;
import com.example.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student save(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Student findById(Long id) {
        return studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public void delete(Long id) {
        studentRepository.deleteById(id);
    }

    public List<Student> search(String keyword) {
        return studentRepository.findByNameContainingIgnoreCase(keyword);
    }
}
