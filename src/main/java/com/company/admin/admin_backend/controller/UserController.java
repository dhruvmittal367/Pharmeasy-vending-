package com.company.admin.admin_backend.controller;

import com.company.admin.admin_backend.Service.UserService;
import com.company.admin.admin_backend.entity.AppUser;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping
    public List<AppUser> getAll() {
        return service.getAll();
    }

    @PostMapping
    public AppUser create(@Valid @RequestBody AppUser user) {
        return service.create(user);
    }

    @PutMapping("/{id}")
    public AppUser update( @Valid @PathVariable Long id, @RequestBody AppUser user) {
        return service.update(id, user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@Valid @PathVariable Long id) {
        service.delete(id);
    }
    @PutMapping("/{id}/toggle-status")
    public AppUser toggleUser(@PathVariable Long id) {
        return service.toggleActive(id);
    }
}

