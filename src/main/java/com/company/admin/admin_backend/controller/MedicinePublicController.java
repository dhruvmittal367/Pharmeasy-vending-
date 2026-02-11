package com.company.admin.admin_backend.controller;

import com.company.admin.admin_backend.Service.MedicineService;
import com.company.admin.admin_backend.dto.MedicineDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicinePublicController {

    private final MedicineService medicineService;

    public MedicinePublicController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    // 🔓 READ ONLY (ADMIN + DOCTOR)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy) {

        List<MedicineDTO> medicines =
                medicineService.getAllMedicines(search, category, sortBy);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", medicines.size());
        response.put("data", medicines);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMedicineById(@PathVariable Long id) {
        MedicineDTO medicine = medicineService.getMedicineById(id);

        return ResponseEntity.ok(
                Map.of("success", true, "data", medicine)
        );
    }
}

