package com.company.admin.admin_backend.dto;

import java.time.LocalDateTime;

public class PrescriptionVersionDTO {
    private LocalDateTime createdAt;
    private Integer medicineCount;
    private String notes;

    // No-args constructor
    public PrescriptionVersionDTO() {
    }

    // All-args constructor
    public PrescriptionVersionDTO(LocalDateTime createdAt, Integer medicineCount, String notes) {
        this.createdAt = createdAt;
        this.medicineCount = medicineCount;
        this.notes = notes;
    }

    // Getters and Setters
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getMedicineCount() {
        return medicineCount;
    }

    public void setMedicineCount(Integer medicineCount) {
        this.medicineCount = medicineCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}