package com.company.admin.admin_backend.Service;

import com.company.admin.admin_backend.repository.UserRepository;
import com.company.admin.admin_backend.entity.AppUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    // CREATE user
    public AppUser create(AppUser user) {

        if (repo.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        user.setPassword(encoder.encode(user.getPassword()));
        user.setActive(true);

        return repo.save(user);
    }

    // GET all users
    public List<AppUser> getAll() {
        return repo.findAll();
    }

    // UPDATE user
    public AppUser update(Long id, AppUser updated) {

        AppUser user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        repo.findByUsername(updated.getUsername())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Username already exists"
                        );
                    }
                });

        user.setFirstName(updated.getFirstName());
        user.setLastName(updated.getLastName());
        user.setUsername(updated.getUsername());
        user.setEmail(updated.getEmail());
        user.setMobile(updated.getMobile());

        user.setLocation(updated.getLocation());
        user.setLicenseNumber(updated.getLicenseNumber());
        user.setRole(updated.getRole());

        // only update password if user typed one
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            user.setPassword(encoder.encode(updated.getPassword()));
        }

        return repo.save(user);
    }

    public AppUser toggleActive(Long id) {
        AppUser user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));


        user.setActive(!user.isActive());
        return repo.save(user);

    }
    // DELETE user
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
