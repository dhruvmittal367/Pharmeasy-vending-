package com.company.admin.admin_backend.repository;

import com.company.admin.admin_backend.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import com.company.admin.admin_backend.entity.AppUser;

import java.util.Optional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByResetToken(String resetToken);
    Optional<AppUser> findByMobile(String mobile);


    boolean existsByUsername(String username);
    boolean existsByRole(Role role);

}




