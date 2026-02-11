package com.company.admin.admin_backend.repository;

import com.company.admin.admin_backend.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {
}

