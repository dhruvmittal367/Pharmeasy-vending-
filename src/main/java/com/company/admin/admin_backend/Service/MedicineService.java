package com.company.admin.admin_backend.Service;

import com.company.admin.admin_backend.dto.MedicineDTO;
import com.company.admin.admin_backend.dto.MedicineStatsDTO;
import com.company.admin.admin_backend.entity.Medicine;
import com.company.admin.admin_backend.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    // ✅ EXPLICIT CONSTRUCTOR (THIS FIXES EVERYTHING)
    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    // ================= ADD MEDICINE =================
    @Transactional
    public MedicineDTO addMedicine(MedicineDTO medicineDTO) {
        Medicine medicine = new Medicine();

        medicine.setMedicineName(medicineDTO.getMedicineName());
        medicine.setGenericName(medicineDTO.getGenericName());
        medicine.setManufacturer(medicineDTO.getManufacturer());
        medicine.setQuantity(medicineDTO.getQuantity());
        medicine.setPrice(medicineDTO.getPrice());
        medicine.setCategory(medicineDTO.getCategory());
        medicine.setDosageForm(medicineDTO.getDosageForm());
        medicine.setExpiryDate(medicineDTO.getExpiryDate());
        medicine.setBatchNumber(medicineDTO.getBatchNumber());
        medicine.setStrength(medicineDTO.getStrength());
        medicine.setStorageCondition(medicineDTO.getStorageCondition());
        medicine.setPrescriptionRequired(
                medicineDTO.getPrescriptionRequired() != null
                        ? medicineDTO.getPrescriptionRequired()
                        : false
        );
        medicine.setDescription(medicineDTO.getDescription());
        medicine.setIsDeleted(false);

        Medicine saved = medicineRepository.save(medicine);
        return convertToDTO(saved);
    }

    // ================= GET ALL =================
    public List<MedicineDTO> getAllMedicines(String search, String category, String sortBy) {
        List<Medicine> medicines;

        if (search != null && !search.isEmpty()) {
            medicines = medicineRepository.searchMedicines(search);
        } else if (category != null && !category.isEmpty()) {
            medicines = medicineRepository.findByCategoryAndIsDeletedFalse(category);
        } else {
            medicines = medicineRepository.findByIsDeletedFalse();
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "name":
                    medicines.sort(Comparator.comparing(Medicine::getMedicineName));
                    break;
                case "price":
                    medicines.sort(Comparator.comparing(Medicine::getPrice));
                    break;
                case "quantity":
                    medicines.sort(Comparator.comparing(Medicine::getQuantity));
                    break;
            }
        }

        return medicines.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ================= GET BY ID =================
    public MedicineDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        return convertToDTO(medicine);
    }

    // ================= UPDATE =================
    @Transactional
    public MedicineDTO updateMedicine(Long id, MedicineDTO medicineDTO) {
        Medicine medicine = medicineRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        medicine.setMedicineName(medicineDTO.getMedicineName());
        medicine.setGenericName(medicineDTO.getGenericName());
        medicine.setManufacturer(medicineDTO.getManufacturer());
        medicine.setQuantity(medicineDTO.getQuantity());
        medicine.setPrice(medicineDTO.getPrice());
        medicine.setCategory(medicineDTO.getCategory());
        medicine.setDosageForm(medicineDTO.getDosageForm());
        medicine.setExpiryDate(medicineDTO.getExpiryDate());
        medicine.setBatchNumber(medicineDTO.getBatchNumber());
        medicine.setStrength(medicineDTO.getStrength());
        medicine.setStorageCondition(medicineDTO.getStorageCondition());
        medicine.setPrescriptionRequired(medicineDTO.getPrescriptionRequired());
        medicine.setDescription(medicineDTO.getDescription());

        return convertToDTO(medicineRepository.save(medicine));
    }

    // ================= DELETE =================
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        medicine.setIsDeleted(true);
        medicine.setDeletedAt(LocalDateTime.now());
        medicineRepository.save(medicine);
    }

    // ================= LOW STOCK =================
    public List<MedicineDTO> getLowStockMedicines(Integer threshold) {
        if (threshold == null) threshold = 10;

        return medicineRepository.findLowStockMedicines(threshold)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ================= EXPIRING =================
    public List<MedicineDTO> getExpiringMedicines(Integer days) {
        if (days == null) days = 30;

        LocalDate today = LocalDate.now();
        LocalDate future = today.plusDays(days);

        return medicineRepository.findExpiringMedicines(today, future)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ================= STATS =================
    public MedicineStatsDTO getStats() {
        Long total = medicineRepository.countByIsDeletedFalse();
        Double value = medicineRepository.calculateTotalInventoryValue();
        Long lowStock = (long) medicineRepository.findLowStockMedicines(10).size();
        Long expiring = (long) medicineRepository.findExpiringMedicines(
                LocalDate.now(),
                LocalDate.now().plusDays(30)
        ).size();

        return new MedicineStatsDTO(
                total,
                value != null ? value : 0.0,
                lowStock,
                expiring
        );
    }

    // ================= ENTITY → DTO =================
    private MedicineDTO convertToDTO(Medicine medicine) {
        MedicineDTO dto = new MedicineDTO();
        dto.setId(medicine.getId());
        dto.setMedicineName(medicine.getMedicineName());
        dto.setGenericName(medicine.getGenericName());
        dto.setManufacturer(medicine.getManufacturer());
        dto.setQuantity(medicine.getQuantity());
        dto.setPrice(medicine.getPrice());
        dto.setCategory(medicine.getCategory());
        dto.setDosageForm(medicine.getDosageForm());
        dto.setExpiryDate(medicine.getExpiryDate());
        dto.setBatchNumber(medicine.getBatchNumber());
        dto.setStrength(medicine.getStrength());
        dto.setStorageCondition(medicine.getStorageCondition());
        dto.setPrescriptionRequired(medicine.getPrescriptionRequired());
        dto.setDescription(medicine.getDescription());
        dto.setCreatedAt(medicine.getCreatedAt());
        dto.setUpdatedAt(medicine.getUpdatedAt());
        return dto;
    }
}
