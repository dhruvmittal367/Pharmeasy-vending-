package com.company.admin.admin_backend.Service;

import com.company.admin.admin_backend.entity.PrescriptionItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QRCodeService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate QR Code as BufferedImage
     */
    public BufferedImage generateQRCodeImage(String data, int width, int height) throws WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    /**
     * Create QR Code data JSON for prescription
     */
    public String createPrescriptionQRData(Long prescriptionId, List<PrescriptionItem> items) {
        try {
            // Calculate expiry date (3 days from now)
            LocalDate expiryDate = LocalDate.now().plusDays(3);

            // Build medicines list
            List<Map<String, Object>> medicines = items.stream()
                    .map(item -> {
                        Map<String, Object> medicine = new LinkedHashMap<>();
                        medicine.put("itemId", item.getId()); // Prescription Item ID
                        medicine.put("medicineId", item.getMedicine() != null ?
                                item.getMedicine().getId() : null); // Medicine ID
                        medicine.put("name", item.getMedicine() != null ?
                                item.getMedicine().getMedicineName() : "N/A");
                        medicine.put("qty", item.getQuantity() != null ? item.getQuantity() : 1);
                        return medicine;
                    })
                    .collect(Collectors.toList());

            // Build QR data structure
            Map<String, Object> qrData = new LinkedHashMap<>();
            qrData.put("prescriptionId", prescriptionId);
            qrData.put("expiresOn", expiryDate.toString());
            qrData.put("medicines", medicines);

            // Convert to JSON string
            String jsonData = objectMapper.writeValueAsString(qrData);

            // Generate SHA-256 hash
            String hash = generateHash(jsonData);

            // Add hash to data
            qrData.put("hash", hash);

            // Return final JSON with hash
            return objectMapper.writeValueAsString(qrData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create QR code data", e);
        }
    }

    /**
     * Generate SHA-256 hash for verification
     */
    private String generateHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            // Return first 16 characters (shorter for QR code)
            return hexString.toString().substring(0, 16);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate hash", e);
        }
    }

    /**
     * Verify QR code data (for future use)
     */
    public boolean verifyQRData(String qrDataJson) {
        try {
            Map<String, Object> qrData = objectMapper.readValue(qrDataJson, Map.class);

            // Extract hash
            String providedHash = (String) qrData.get("hash");
            if (providedHash == null) return false;

            // Remove hash from data
            qrData.remove("hash");
            String dataWithoutHash = objectMapper.writeValueAsString(qrData);

            // Generate hash and compare
            String calculatedHash = generateHash(dataWithoutHash);

            // Check expiry
            String expiresOn = (String) qrData.get("expiresOn");
            LocalDate expiryDate = LocalDate.parse(expiresOn);
            boolean isExpired = LocalDate.now().isAfter(expiryDate);

            return calculatedHash.equals(providedHash) && !isExpired;

        } catch (Exception e) {
            return false;
        }
    }
}