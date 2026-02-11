package com.company.admin.admin_backend.repository;

import com.company.admin.admin_backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // Find all medicines that are not deleted
    List<Medicine> findByIsDeletedFalse();

    // Find medicine by ID that is not deleted
    Optional<Medicine> findByIdAndIsDeletedFalse(Long id);

    // Search medicines by name, generic name, or manufacturer
    @Query("SELECT m FROM Medicine m WHERE m.isDeleted = false AND " +
            "(LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Medicine> searchMedicines(@Param("search") String search);

    // Find by category
    List<Medicine> findByCategoryAndIsDeletedFalse(String category);

    // Find low stock medicines
    @Query("SELECT m FROM Medicine m WHERE m.isDeleted = false AND m.quantity <= :threshold")
    List<Medicine> findLowStockMedicines(@Param("threshold") Integer threshold);

    // Find expiring medicines
    @Query("SELECT m FROM Medicine m WHERE m.isDeleted = false AND " +
            "m.expiryDate BETWEEN :today AND :futureDate")
    List<Medicine> findExpiringMedicines(
            @Param("today") LocalDate today,
            @Param("futureDate") LocalDate futureDate
    );

    // Count medicines by deleted status
    Long countByIsDeletedFalse();

    // Calculate total inventory value
    @Query("SELECT SUM(m.price * m.quantity) FROM Medicine m WHERE m.isDeleted = false")
    Double calculateTotalInventoryValue();
}
