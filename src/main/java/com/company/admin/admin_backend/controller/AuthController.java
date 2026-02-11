package com.company.admin.admin_backend.controller;

import com.company.admin.admin_backend.Service.EmailService;
import com.company.admin.admin_backend.Service.SmsService;
import com.company.admin.admin_backend.dto.LoginRequest;
import com.company.admin.admin_backend.dto.RegisterRequest;
import com.company.admin.admin_backend.dto.ForgotPasswordRequest;
import com.company.admin.admin_backend.dto.ResetPasswordRequest;
import com.company.admin.admin_backend.entity.AppUser;
import com.company.admin.admin_backend.repository.UserRepository;
import com.company.admin.admin_backend.security.JwtUtil;
import com.company.admin.admin_backend.user.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Autowired
    private SmsService smsService;


    public AuthController(
            UserRepository repo,
            PasswordEncoder encoder,
            JwtUtil jwtUtil,
            EmailService emailService
    ) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ================= FIRST ADMIN ONLY =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (repo.existsByRole(Role.ADMIN)) {
            return ResponseEntity.status(403).body("Admin already exists");
        }

        AppUser admin = new AppUser();
        admin.setUsername(req.getUsername());
        admin.setPassword(encoder.encode(req.getPassword()));
        admin.setRole(Role.ADMIN);

        // Auto-fill required DB fields
        admin.setFirstName("System");
        admin.setLastName("Admin");
        admin.setEmail("systembackend0001@gmail.com");
        admin.setMobile("0000000000");
        admin.setActive(true);

        repo.save(admin);

        return ResponseEntity.ok("Admin created");
    }

    // ================= LOGIN (JWT) =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        AppUser user = repo.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username or password"
                ));

        // 🔒 BLOCK DISABLED USER LOGIN (ONLY HERE)
        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is disabled"
            );
        }

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        String token = jwtUtil.generateToken(user);

        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "role", user.getRole().name(),
                        "username", user.getUsername()
                )
        );

    }




    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        AppUser user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Email not registered"
                ));

        String resetToken = UUID.randomUUID().toString();

        user.setResetToken(resetToken);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));

        repo.save(user);

        String resetLink =
                "http://localhost:3000/reset-password?token=" + resetToken;

        emailService.send(
                user.getEmail(),
                "Admin Password Reset",
                "Click the link to reset your password:\n" + resetLink
        );

        return ResponseEntity.ok("Reset password link sent to email");
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        AppUser user = repo.findByResetToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid reset token"
                ));

        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reset token expired"
            );
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setTokenExpiry(null);

        repo.save(user);

        return ResponseEntity.ok("Password reset successful");
    }

    @PostMapping("/forgot-password/mobile")
    public ResponseEntity<?> forgotPasswordByMobile(
            @RequestBody Map<String, String> request) {

        AppUser user = repo.findByMobile(request.get("mobile"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Mobile not registered"));

        // ✅ OTP generate using helper
        String otp = generateOtp();

        // ✅ OTP expiry
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        user.setOtpAttempts(1);
        user.setOtpLastSentAt(LocalDateTime.now());

        repo.save(user);

        // ✅ Send real SMS
        smsService.sendOtp("+91" + user.getMobile(), otp);

        return ResponseEntity.ok("OTP sent to mobile");
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> request) {

        AppUser user = repo.findByMobile(request.get("mobile"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (user.getOtp() == null ||
                !user.getOtp().equals(request.get("otp")) ||
                user.getOtpExpiry().isBefore(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
        repo.save(user);

        return ResponseEntity.ok("OTP verified");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> req) {

        AppUser user = repo.findByMobile(req.get("mobile"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        // ⏱ Cooldown 60 sec
        if (user.getOtpLastSentAt() != null &&
                user.getOtpLastSentAt().plusSeconds(60).isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait before resending OTP");
        }

        // 🔁 Max 3 attempts
        if (user.getOtpAttempts() != null && user.getOtpAttempts() >= 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Max OTP attempts reached");
        }

        String otp = generateOtp();

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setOtpAttempts(user.getOtpAttempts() + 1);
        user.setOtpLastSentAt(LocalDateTime.now());

        repo.save(user);

        smsService.sendOtp("+91" + user.getMobile(), otp);

        return ResponseEntity.ok("OTP resent");
    }

    @PostMapping("/reset-password/mobile")
    public ResponseEntity<?> resetPasswordByMobile(
            @RequestBody Map<String, String> request) {

        AppUser user = repo.findByMobile(request.get("mobile"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(encoder.encode(request.get("newPassword")));
        repo.save(user);

        return ResponseEntity.ok("Password reset successful");
    }


    @GetMapping("/")
    public String home() {
        return "Admin Backend is running";
    }
}
