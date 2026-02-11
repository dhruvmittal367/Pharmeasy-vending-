package com.company.admin.admin_backend.Service;

import com.company.admin.admin_backend.dto.PatientDTO;
import com.company.admin.admin_backend.dto.PrescriptionRequestDTO;
import com.company.admin.admin_backend.entity.*;
import com.company.admin.admin_backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepo;
    private final MedicineRepository medicineRepo;

    public PrescriptionService(PrescriptionRepository prescriptionRepo,
                               MedicineRepository medicineRepo) {
        this.prescriptionRepo = prescriptionRepo;
        this.medicineRepo = medicineRepo;
    }

    @Transactional
    public Prescription savePrescription(PrescriptionRequestDTO dto) {

        Prescription prescription;

        // ✅ CHECK: If patientId exists, UPDATE existing patient
        if (dto.getPatientId() != null) {
            // Update existing prescription
            prescription = prescriptionRepo.findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.getPatientId()));

            // Update patient basic info
            prescription.setPatientName(dto.getPatient().getName());
            prescription.setAge(dto.getPatient().getAge());
            prescription.setGender(dto.getPatient().getGender());
            prescription.setWeight(dto.getPatient().getWeight());
            prescription.setContactNo(dto.getPatient().getContactNo());
            prescription.setLocation(dto.getPatient().getLocation());
            prescription.setSymptoms(dto.getPatient().getSymptoms());
            prescription.setNotes(dto.getPatient().getNotes());
            prescription.setVisitDate(LocalDate.parse(dto.getPatient().getDate()));

            // ✅ IMPORTANT: Don't clear existing items
            // We'll add new items to the existing list

        } else {
            // ✅ CREATE new patient/prescription
            prescription = new Prescription();
            prescription.setPatientName(dto.getPatient().getName());
            prescription.setAge(dto.getPatient().getAge());
            prescription.setGender(dto.getPatient().getGender());
            prescription.setWeight(dto.getPatient().getWeight());
            prescription.setContactNo(dto.getPatient().getContactNo());
            prescription.setLocation(dto.getPatient().getLocation());
            prescription.setSymptoms(dto.getPatient().getSymptoms());
            prescription.setNotes(dto.getPatient().getNotes());
            prescription.setVisitDate(LocalDate.parse(dto.getPatient().getDate()));
            prescription.setItems(new ArrayList<>()); // Initialize empty list
        }

        // ✅ Add new prescription items (medicines)
        for (PrescriptionRequestDTO.MedicineItemDTO m : dto.getMedicines()) {
            Medicine medicine = medicineRepo.findById(m.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));

            PrescriptionItem item = new PrescriptionItem();
            item.setPrescription(prescription);
            item.setMedicine(medicine);
            item.setQuantity(m.getQuantity());
            item.setPrice(m.getPrice());
            item.setTotal(m.getTotal());
            item.setDose(m.getDose());
            item.setDuration(m.getDuration());
            item.setInstructions(m.getInstructions());
            item.setTestRequired(m.getTestRequired());
            item.setTestName(m.getTestName());

            prescription.getItems().add(item);
        }

        // Update total amount
        prescription.setTotalAmount(dto.getTotalAmount());

        return prescriptionRepo.save(prescription);
    }

    public List<Prescription> getAllSortedPrescriptions() {      //getallprescription
        return prescriptionRepo.findAllOrderByLastItemUpdate(); //changes find all()
    }

    public List<PatientDTO> getAllPatients() {
        List<Prescription> prescriptions = prescriptionRepo.findAllOrderByLastItemUpdate(); //chnages find all()

        return prescriptions.stream()
                .map(p -> new PatientDTO(
                        p.getId(),
                        p.getPatientName(),
                        p.getAge(),
                        p.getGender(),
                        p.getWeight(),
                        p.getContactNo(),
                        p.getLocation(),
                        p.getSymptoms(),
                        p.getNotes(),
                        p.getVisitDate()

                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public Prescription updatePrescription(Long id, PrescriptionRequestDTO dto) {
        Optional<Prescription> existingOpt = prescriptionRepo.findById(id);

        if (existingOpt.isEmpty()) {
            return null;
        }

        Prescription prescription = existingOpt.get();

        // Update patient info fields - only if provided in DTO
        if (dto.getPatient() != null) {
            PrescriptionRequestDTO.PatientDTO patientDTO = dto.getPatient();

            if (patientDTO.getName() != null) {
                prescription.setPatientName(patientDTO.getName());
            }
            if (patientDTO.getAge() != null) {
                prescription.setAge(patientDTO.getAge());
            }
            if (patientDTO.getGender() != null) {
                prescription.setGender(patientDTO.getGender());
            }
            if (patientDTO.getWeight() != null) {
                prescription.setWeight(patientDTO.getWeight());
            }
            if (patientDTO.getContactNo() != null) {
                prescription.setContactNo(patientDTO.getContactNo());
            }
            if (patientDTO.getLocation() != null) {
                prescription.setLocation(patientDTO.getLocation());
            }
            if (patientDTO.getSymptoms() != null) {
                prescription.setSymptoms(patientDTO.getSymptoms());
            }
            if (patientDTO.getNotes() != null) {
                prescription.setNotes(patientDTO.getNotes());
            }
            if (patientDTO.getDate() != null) {
                prescription.setVisitDate(LocalDate.parse(patientDTO.getDate()));
            }
        }

        // Update total amount if provided
        if (dto.getTotalAmount() != null) {
            prescription.setTotalAmount(dto.getTotalAmount());
        }

        // Update medicines/prescription items if provided
        if (dto.getMedicines() != null && !dto.getMedicines().isEmpty()) {
            // Clear existing items
            prescription.getItems().clear();

            // Add new items
            List<PrescriptionItem> newItems = new ArrayList<>();

            for (PrescriptionRequestDTO.MedicineItemDTO m : dto.getMedicines()) {
                Medicine medicine = medicineRepo.findById(m.getMedicineId())
                        .orElseThrow(() -> new RuntimeException("Medicine not found"));

                PrescriptionItem item = new PrescriptionItem();
                item.setPrescription(prescription);
                item.setMedicine(medicine);
                item.setQuantity(m.getQuantity());
                item.setPrice(m.getPrice());
                item.setTotal(m.getTotal());
                item.setDose(m.getDose());
                item.setDuration(m.getDuration());
                item.setInstructions(m.getInstructions());
                item.setTestRequired(m.getTestRequired());
                item.setTestName(m.getTestName());

                newItems.add(item);
            }

            prescription.setItems(newItems);
        }

        return prescriptionRepo.save(prescription);
    }

    /**
     * Delete a prescription/patient by ID
     * @param id - Prescription ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deletePrescription(Long id) {
        Optional<Prescription> existingOpt = prescriptionRepo.findById(id);

        if (existingOpt.isEmpty()) {
            return false;
        }

        prescriptionRepo.deleteById(id);
        return true;
    }

    /** // in notepad
     * Get a single prescription by ID
     * @param id - Prescription ID
     * @return Prescription or null if not found
     */
    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepo.findById(id).orElse(null);
    }

}