package com.company.admin.admin_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientDTO {
    private Long id;
    private String patientName;
    private Integer age;
    private String gender;
    private Double weight;
    private String contactNo;
    private String location;
    private String symptoms;
    private String notes;
    private LocalDate visitDate;


    // Constructor
    public PatientDTO( Long id, String patientName, Integer age, String gender,
                      Double weight, String contactNo, String location,  String symptoms,String notes,
                      LocalDate visitDate) {
        this.id = id;
        this.patientName = patientName;
        this.age = age;
        this.gender = gender;
        this.weight = weight;
        this.contactNo = contactNo;
        this.location = location;
        this.symptoms = symptoms;
        this.notes = notes;
        this.visitDate = visitDate;

    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
