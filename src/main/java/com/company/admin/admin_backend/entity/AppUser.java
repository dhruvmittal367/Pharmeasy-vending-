package com.company.admin.admin_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import com.company.admin.admin_backend.user.Role;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    @Pattern(regexp = "^[A-Z][a-zA-Z]{1,29}$",
            message = "First name must start with capital letter")
    private String firstName;

    @NotBlank
    @Pattern(regexp = "^[A-Z][a-zA-Z]{1,29}$",
            message = "Last name must start with capital letter")
    private String lastName;

    @Column(unique = true, nullable = false)
    @NotBlank
    @Size(min = 4, max = 20)
    @Pattern(regexp = "^[a-z0-9]+$",
            message = "Username must be lowercase and without spaces")
    private String username;

    @Column(nullable = false)
    @NotBlank

    private String password;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Invalid mobile number")
    private String mobile;

    @Column(length = 500)
    private String location;

    @Column(length = 100)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean active = true;


    private String resetToken;
    private LocalDateTime tokenExpiry;

    private String otp;
    private LocalDateTime otpExpiry;

    private Integer otpAttempts;
    private LocalDateTime otpLastSentAt;



    // Getters & Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(LocalDateTime tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(LocalDateTime otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public Integer getOtpAttempts() {
        return otpAttempts;
    }

    public void setOtpAttempts(Integer otpAttempts) {
        this.otpAttempts = otpAttempts;
    }

    public LocalDateTime getOtpLastSentAt() {
        return otpLastSentAt;
    }

    public void setOtpLastSentAt(LocalDateTime otpLastSentAt) {
        this.otpLastSentAt = otpLastSentAt;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
}

