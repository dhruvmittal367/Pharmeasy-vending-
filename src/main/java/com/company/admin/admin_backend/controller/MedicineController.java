package com.company.admin.admin_backend.controller;

import com.company.admin.admin_backend.Service.MedicineService;
import com.company.admin.admin_backend.dto.MedicineDTO;
import com.company.admin.admin_backend.dto.MedicineStatsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    @Autowired
    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    // Add new medicine
    @PostMapping
    public ResponseEntity<Map<String, Object>> addMedicine(@RequestBody MedicineDTO medicineDTO) {
        try {
            MedicineDTO savedMedicine = medicineService.addMedicine(medicineDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine added successfully");
            response.put("data", savedMedicine);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error adding medicine");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all medicines with optional filters
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy) {
        try {
            List<MedicineDTO> medicines = medicineService.getAllMedicines(search, category, sortBy);
            MedicineStatsDTO stats = medicineService.getStats();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", medicines.size());
            response.put("stats", stats);
            response.put("data", medicines);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching medicines");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMedicineById(@PathVariable Long id) {
        try {
            MedicineDTO medicine = medicineService.getMedicineById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", medicine);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching medicine");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMedicine(
            @PathVariable Long id,
            @RequestBody MedicineDTO medicineDTO) {
        try {
            MedicineDTO updatedMedicine = medicineService.updateMedicine(id, medicineDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine updated successfully");
            response.put("data", updatedMedicine);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating medicine");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Soft delete medicine
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine deleted successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting medicine");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get low stock medicines
    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> getLowStockMedicines(
            @RequestParam(required = false, defaultValue = "10") Integer threshold) {
        try {
            List<MedicineDTO> medicines = medicineService.getLowStockMedicines(threshold);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", medicines.size());
            response.put("threshold", threshold);
            response.put("data", medicines);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching low stock medicines");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get expiring medicines
    @GetMapping("/expiring")
    public ResponseEntity<Map<String, Object>> getExpiringMedicines(
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        try {
            List<MedicineDTO> medicines = medicineService.getExpiringMedicines(days);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", medicines.size());
            response.put("daysThreshold", days);
            response.put("data", medicines);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching expiring medicines");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            MedicineStatsDTO stats = medicineService.getStats();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching statistics");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}