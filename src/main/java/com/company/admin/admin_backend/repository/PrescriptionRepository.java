package com.company.admin.admin_backend.repository;

import com.company.admin.admin_backend.entity.Prescription;
import com.company.admin.admin_backend.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.medicine WHERE p.id = :id")
    Optional<Prescription> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT DISTINCT pi FROM PrescriptionItem pi " +
            "LEFT JOIN FETCH pi.medicine " +
            "WHERE pi.prescription.id = :prescriptionId " +
            "AND pi.createdAt = (SELECT MAX(pi2.createdAt) FROM PrescriptionItem pi2 " +
            "WHERE pi2.prescription.id = :prescriptionId) " +
            "ORDER BY pi.id ASC")
    List<PrescriptionItem> findLatestBatchByPrescriptionId(@Param("prescriptionId") Long prescriptionId);

    @Query("""
    SELECT p
    FROM Prescription p
    LEFT JOIN p.items i
    GROUP BY p
    ORDER BY MAX(i.createdAt) DESC
    """)
    List<Prescription> findAllOrderByLastItemUpdate();//chnages complete

    //new changes

    @Query("SELECT DISTINCT pi.createdAt FROM PrescriptionItem pi " +
            "WHERE pi.prescription.id = :prescriptionId " +
            "ORDER BY pi.createdAt DESC")
    List<LocalDateTime> findAllBatchTimestamps(@Param("prescriptionId") Long prescriptionId);

    /**
     * Fetch prescription items for a specific timestamp (version)
     */
    @Query("SELECT DISTINCT pi FROM PrescriptionItem pi " +
            "LEFT JOIN FETCH pi.medicine " +
            "WHERE pi.prescription.id = :prescriptionId " +
            "AND pi.createdAt = :timestamp " +
            "ORDER BY pi.id ASC")
    List<PrescriptionItem> findItemsByPrescriptionIdAndTimestamp(
            @Param("prescriptionId") Long prescriptionId,
            @Param("timestamp") LocalDateTime timestamp
    );

}





