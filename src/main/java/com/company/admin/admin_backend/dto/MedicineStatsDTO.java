package com.company.admin.admin_backend.dto;

public class MedicineStatsDTO {

    private Long totalMedicines;
    private Double totalInventoryValue;
    private Long lowStockItems;
    private Long expiringSoon;

    // Constructors
    public MedicineStatsDTO() {
    }

    public MedicineStatsDTO(Long totalMedicines, Double totalInventoryValue,
                            Long lowStockItems, Long expiringSoon) {
        this.totalMedicines = totalMedicines;
        this.totalInventoryValue = totalInventoryValue;
        this.lowStockItems = lowStockItems;
        this.expiringSoon = expiringSoon;
    }

    // Getters and Setters
    public Long getTotalMedicines() {
        return totalMedicines;
    }

    public void setTotalMedicines(Long totalMedicines) {
        this.totalMedicines = totalMedicines;
    }

    public Double getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(Double totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public Long getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(Long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public Long getExpiringSoon() {
        return expiringSoon;
    }

    public void setExpiringSoon(Long expiringSoon) {
        this.expiringSoon = expiringSoon;
    }
}