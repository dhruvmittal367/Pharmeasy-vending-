package com.company.admin.admin_backend.controller;

import com.company.admin.admin_backend.Service.PrescriptionPDFService;
import com.company.admin.admin_backend.dto.PatientDTO;
import com.company.admin.admin_backend.dto.PrescriptionRequestDTO;
import com.company.admin.admin_backend.dto.PrescriptionVersionDTO;
import com.company.admin.admin_backend.entity.Prescription;
import com.company.admin.admin_backend.Service.PrescriptionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService service;
    private final PrescriptionPDFService pdfService;


    public PrescriptionController(PrescriptionService service, PrescriptionPDFService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @GetMapping
    public List<Prescription> getAllPrescriptions() {

        return service.getAllSortedPrescriptions();   //chages get all prescription
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PrescriptionRequestDTO dto) {
        Prescription saved = service.savePrescription(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = service.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPrescriptionPDF(@PathVariable Long id) {
        try {
            byte[] pdfBytes = pdfService.generatePrescriptionPDF(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "prescription_" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<PrescriptionVersionDTO>> getPrescriptionVersions(@PathVariable Long id) {
        try {
            List<PrescriptionVersionDTO> versions = pdfService.getAllPrescriptionVersions(id);
            return ResponseEntity.ok(versions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/pdf/timestamp")
    public ResponseEntity<byte[]> downloadPrescriptionPDFByTimestamp(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp) {
        try {
            byte[] pdfBytes = pdfService.generatePrescriptionPDFByTimestamp(id, timestamp);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "prescription_" + id + "_" + timestamp.toString().replace(":", "-") + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updatePrescription(@PathVariable Long id, @RequestBody PrescriptionRequestDTO request) {
        try {
            Prescription updated = service.updatePrescription(id, request);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Patient not found with id: " + id));
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update patient: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> replacePrescription(@PathVariable Long id, @RequestBody PrescriptionRequestDTO request) {
        try {
            Prescription updated = service.updatePrescription(id, request);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Patient not found with id: " + id));
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update patient: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrescription(@PathVariable Long id) {
        try {
            boolean deleted = service.deletePrescription(id);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Patient not found with id: " + id));
            }
            return ResponseEntity.ok(Map.of("message", "Patient deleted successfully", "id", id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete patient: " + e.getMessage()));
        }
    }


}

