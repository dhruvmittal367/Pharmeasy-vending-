package com.company.admin.admin_backend.Service;

import com.company.admin.admin_backend.dto.PrescriptionVersionDTO;
import com.company.admin.admin_backend.entity.Prescription;
import com.company.admin.admin_backend.entity.PrescriptionItem;
import com.company.admin.admin_backend.repository.PrescriptionRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionPDFService {

    private final PrescriptionRepository prescriptionRepository;

    @Autowired
    private QRCodeService qrCodeService;

    public PrescriptionPDFService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    public byte[] generatePrescriptionPDF(Long prescriptionId) throws Exception {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        List<PrescriptionItem> items = prescriptionRepository
                .findLatestBatchByPrescriptionId(prescriptionId);

        System.out.println("✅ Latest prescription batch items for PDF: " + items.size());

        if (items.isEmpty()) {
            throw new RuntimeException("No medicines found in latest prescription");
        }

        return generatePDF(prescription, items);
    }

    public byte[] generatePrescriptionPDFByTimestamp(Long prescriptionId, LocalDateTime timestamp) throws Exception {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        List<PrescriptionItem> items = prescriptionRepository
                .findItemsByPrescriptionIdAndTimestamp(prescriptionId, timestamp);

        System.out.println("✅ Prescription items for timestamp " + timestamp + ": " + items.size());

        if (items.isEmpty()) {
            throw new RuntimeException("No medicines found for this prescription version");
        }

        return generatePDF(prescription, items);
    }

    public List<PrescriptionVersionDTO> getAllPrescriptionVersions(Long prescriptionId) {
        List<LocalDateTime> timestamps = prescriptionRepository.findAllBatchTimestamps(prescriptionId);

        return timestamps.stream()
                .map(timestamp -> {
                    List<PrescriptionItem> items = prescriptionRepository
                            .findItemsByPrescriptionIdAndTimestamp(prescriptionId, timestamp);

                    String notes = items.isEmpty() ? "" :
                            (items.get(0).getPrescription().getNotes() != null ?
                                    items.get(0).getPrescription().getNotes() : "");

                    return new PrescriptionVersionDTO(
                            timestamp,
                            items.size(),
                            notes
                    );
                })
                .collect(Collectors.toList());
    }

    private byte[] generatePDF(Prescription prescription, List<PrescriptionItem> items) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        document.open();

        BaseColor primaryColor = new BaseColor(102, 126, 234);
        BaseColor headerBg = new BaseColor(248, 249, 250);
        BaseColor borderColor = new BaseColor(224, 224, 224);
        BaseColor successColor = new BaseColor(39, 174, 96);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, primaryColor);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
        Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);
        Font instructionFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, BaseColor.DARK_GRAY);

        // ============================================
        // HEADER WITH LOGO
        // ============================================
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2, 1});
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        PdfPCell clinicCell = new PdfPCell();
        clinicCell.setBorder(Rectangle.NO_BORDER);
        clinicCell.setPaddingBottom(10);
        clinicCell.setVerticalAlignment(Element.ALIGN_TOP);

        try {
            // Load logo from URL
            Image logo = Image.getInstance(new java.net.URL("https://www.critimedsconsult.com/static/web/images/logo.png"));

            // Scale logo to appropriate size (keep aspect ratio)
            logo.scaleToFit(200, 60); // Slightly smaller height for better spacing
            logo.setAlignment(Element.ALIGN_LEFT);
            logo.setSpacingAfter(3); // Minimal spacing after logo

            clinicCell.addElement(logo);

        } catch (Exception e) {
            // Fallback to text if logo fails to load
            System.err.println("Failed to load logo: " + e.getMessage());
            Paragraph clinicName = new Paragraph("HealthCare Clinic", titleFont);
            clinicName.setSpacingAfter(3);
            clinicCell.addElement(clinicName);
        }

        // Clinic contact info below logo (no extra spacing)
        Paragraph clinicInfo = new Paragraph();
        clinicInfo.setFont(smallFont);
        clinicInfo.setSpacingBefore(0); // No spacing before
        clinicInfo.add("CritiMeds Consult, India\n");
        clinicInfo.add("Phone: (+91) 8209857661 (Hemant Garg)\n");
        clinicInfo.add("Email: https://critimedsconsult@gmail.com");
        clinicCell.addElement(clinicInfo);

        headerTable.addCell(clinicCell);

        PdfPCell invoiceCell = new PdfPCell();
        invoiceCell.setBorder(Rectangle.NO_BORDER);
        invoiceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        invoiceCell.setVerticalAlignment(Element.ALIGN_TOP); // Align to top like left side
        invoiceCell.setPaddingBottom(10);
        invoiceCell.setPaddingTop(0); // No top padding for alignment

        // All text aligned to right
        Paragraph invoiceTitle = new Paragraph("PRESCRIPTION", headerFont);
        invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
        invoiceTitle.setSpacingAfter(3); // Match logo spacing
        invoiceCell.addElement(invoiceTitle);

        Paragraph invoiceDetails = new Paragraph();
        invoiceDetails.setFont(normalFont);
        invoiceDetails.setAlignment(Element.ALIGN_RIGHT);
        invoiceDetails.setSpacingBefore(0); // No extra spacing
        invoiceDetails.add("Prescription #: " + String.format("%06d", prescription.getId()) + "\n");
        invoiceDetails.add("Date: " + prescription.getVisitDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "\n");
        invoiceDetails.add("Time: " + prescription.getCreatedAt().format(DateTimeFormatter.ofPattern("hh:mm a")));
        invoiceCell.addElement(invoiceDetails);

        headerTable.addCell(invoiceCell);
        document.add(headerTable);

        LineSeparator line = new LineSeparator();
        line.setLineColor(primaryColor);
        line.setLineWidth(2);
        document.add(new Chunk(line));
        document.add(Chunk.NEWLINE);

        // Patient Info
        PdfPTable patientTable = new PdfPTable(1);
        patientTable.setWidthPercentage(100);
        patientTable.setSpacingAfter(15);

        PdfPCell patientHeaderCell = new PdfPCell(new Phrase("Patient Information", subHeaderFont));
        patientHeaderCell.setBackgroundColor(headerBg);
        patientHeaderCell.setPadding(8);
        patientHeaderCell.setBorder(Rectangle.BOX);
        patientHeaderCell.setBorderColor(borderColor);
        patientTable.addCell(patientHeaderCell);

        PdfPCell patientInfoCell = new PdfPCell();
        patientInfoCell.setPadding(10);
        patientInfoCell.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
        patientInfoCell.setBorderColor(borderColor);

        Paragraph patientInfo = new Paragraph();
        patientInfo.setFont(normalFont);
        patientInfo.add(new Chunk("Name: ", boldFont));
        patientInfo.add(prescription.getPatientName() + "\n");
        patientInfo.add(new Chunk("Age: ", boldFont));
        patientInfo.add(prescription.getAge() + " years" + "    ");
        patientInfo.add(new Chunk("Gender: ", boldFont));
        patientInfo.add(prescription.getGender() + "    ");
        if (prescription.getWeight() != null) {
            patientInfo.add(new Chunk("Weight: ", boldFont));
            patientInfo.add(prescription.getWeight() + " kg\n");
        } else {
            patientInfo.add("\n");
        }

        if (prescription.getContactNo() != null && !prescription.getContactNo().trim().isEmpty()) {
            patientInfo.add(new Chunk("Contact: ", boldFont));
            patientInfo.add(prescription.getContactNo() + "\n");
        }

        if (prescription.getLocation() != null && !prescription.getLocation().isEmpty()) {
            patientInfo.add(new Chunk("Location: ", boldFont));
            patientInfo.add(prescription.getLocation() + "\n");
        }

        if (prescription.getSymptoms() != null && !prescription.getSymptoms().isEmpty()) {
            patientInfo.add(new Chunk("Symptoms: ", boldFont));
            patientInfo.add(prescription.getSymptoms() + "\n");
        }

        if (prescription.getNotes() != null && !prescription.getNotes().isEmpty()) {
            patientInfo.add(new Chunk("Notes: ", boldFont));
            patientInfo.add(prescription.getNotes());
        }

        patientInfoCell.addElement(patientInfo);
        patientTable.addCell(patientInfoCell);
        document.add(patientTable);

        // Medicines Table
        PdfPTable medicinesTable = new PdfPTable(7);
        medicinesTable.setWidthPercentage(100);
        medicinesTable.setWidths(new float[]{0.7f, 2.5f, 1.2f, 1f, 1f, 1.5f, 1f});
        medicinesTable.setSpacingAfter(15);

        String[] headers = {"S.No", "Medicine Name", "Dosage Form", "Dose", "Days", "Instructions", "Price (₹)"};
        for (String header : headers) {
            Phrase phrase = new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE));
            PdfPCell headerCell = new PdfPCell(phrase);
            headerCell.setBackgroundColor(primaryColor);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerCell.setPadding(8);
            headerCell.setBorderColor(BaseColor.WHITE);
            medicinesTable.addCell(headerCell);
        }

        int serialNo = 1;
        double subtotal = 0.0;

        for (PrescriptionItem item : items) {
            PdfPCell cell1 = new PdfPCell(new Phrase(String.valueOf(serialNo++), normalFont));
            cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell1.setPadding(8);
            cell1.setBorderColor(borderColor);
            medicinesTable.addCell(cell1);

            String medicineName = item.getMedicine() != null ? item.getMedicine().getMedicineName() : "N/A";
            PdfPCell cell2 = new PdfPCell(new Phrase(medicineName, normalFont));
            cell2.setPadding(8);
            cell2.setBorderColor(borderColor);
            medicinesTable.addCell(cell2);

            String dosageForm = item.getMedicine() != null && item.getMedicine().getDosageForm() != null
                    ? item.getMedicine().getDosageForm() : "N/A";
            PdfPCell cell3 = new PdfPCell(new Phrase(dosageForm, smallFont));
            cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell3.setPadding(8);
            cell3.setBorderColor(borderColor);
            medicinesTable.addCell(cell3);

            String dose = item.getDose() != null ? item.getDose() : "—";
            PdfPCell cell4 = new PdfPCell(new Phrase(dose, normalFont));
            cell4.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell4.setPadding(8);
            cell4.setBorderColor(borderColor);
            medicinesTable.addCell(cell4);

            String duration = item.getDuration() != null ? item.getDuration() + "" : "—";
            PdfPCell cell5 = new PdfPCell(new Phrase(duration, normalFont));
            cell5.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell5.setPadding(8);
            cell5.setBorderColor(borderColor);
            medicinesTable.addCell(cell5);

            String instructions = item.getInstructions() != null && !item.getInstructions().isEmpty()
                    ? item.getInstructions() : "—";
            PdfPCell cell6 = new PdfPCell(new Phrase(instructions, instructionFont));
            cell6.setPadding(8);
            cell6.setBorderColor(borderColor);
            medicinesTable.addCell(cell6);

            double itemTotal = item.getTotal() != null ? item.getTotal() : 0.0;
            subtotal += itemTotal;
            PdfPCell cell7 = new PdfPCell(new Phrase(String.format("%.2f", itemTotal), normalFont));
            cell7.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cell7.setPadding(8);
            cell7.setBorderColor(borderColor);
            medicinesTable.addCell(cell7);
        }

        document.add(medicinesTable);

        // Test Section
        boolean hasTest = items.stream().anyMatch(item ->
                item.getTestRequired() != null && item.getTestRequired()
        );

        if (hasTest) {
            PdfPTable testTable = new PdfPTable(1);
            testTable.setWidthPercentage(100);
            testTable.setSpacingAfter(15);

            PdfPCell testHeaderCell = new PdfPCell(new Phrase("🧪 Laboratory Test Required", subHeaderFont));
            testHeaderCell.setBackgroundColor(new BaseColor(255, 243, 205));
            testHeaderCell.setPadding(8);
            testHeaderCell.setBorder(Rectangle.BOX);
            testHeaderCell.setBorderColor(new BaseColor(255, 193, 7));
            testTable.addCell(testHeaderCell);

            PdfPCell testInfoCell = new PdfPCell();
            testInfoCell.setPadding(10);
            testInfoCell.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
            testInfoCell.setBorderColor(new BaseColor(255, 193, 7));

            Paragraph testInfo = new Paragraph();
            testInfo.setFont(normalFont);

            List<String> testNames = new ArrayList<>();
            for (PrescriptionItem item : items) {
                if (item.getTestRequired() != null && item.getTestRequired()
                        && item.getTestName() != null && !item.getTestName().isEmpty()
                        && !testNames.contains(item.getTestName())) {
                    testNames.add(item.getTestName());
                }
            }

            if (!testNames.isEmpty()) {
                testInfo.add(new Chunk("Test(s): ", boldFont));
                testInfo.add(String.join(", ", testNames) + "\n");
                testInfo.add(new Chunk("Note: ", boldFont));
                testInfo.add("Please get the above test(s) done before starting medication.");
            } else {
                testInfo.add("Test required - Please consult doctor for details.");
            }

            testInfoCell.addElement(testInfo);
            testTable.addCell(testInfoCell);
            document.add(testTable);
        }

        // Total
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(40);
        totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.setSpacingBefore(10);

        PdfPCell labelCell1 = new PdfPCell(new Phrase("Subtotal:", boldFont));
        labelCell1.setBorder(Rectangle.NO_BORDER);
        labelCell1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell1.setPaddingRight(10);
        totalTable.addCell(labelCell1);

        PdfPCell valueCell1 = new PdfPCell(new Phrase("₹" + String.format("%.2f", subtotal), normalFont));
        valueCell1.setBorder(Rectangle.NO_BORDER);
        valueCell1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.addCell(valueCell1);

        double tax = subtotal * 0.05;
        PdfPCell labelCell2 = new PdfPCell(new Phrase("GST (5%):", boldFont));
        labelCell2.setBorder(Rectangle.NO_BORDER);
        labelCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell2.setPaddingRight(10);
        totalTable.addCell(labelCell2);

        PdfPCell valueCell2 = new PdfPCell(new Phrase("₹" + String.format("%.2f", tax), normalFont));
        valueCell2.setBorder(Rectangle.NO_BORDER);
        valueCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.addCell(valueCell2);

        double total = subtotal + tax;
        PdfPCell labelCell3 = new PdfPCell(new Phrase("Total Amount:",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor)));
        labelCell3.setBorder(Rectangle.TOP);
        labelCell3.setBorderColor(borderColor);
        labelCell3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell3.setPaddingRight(10);
        labelCell3.setPaddingTop(8);
        totalTable.addCell(labelCell3);

        PdfPCell valueCell3 = new PdfPCell(new Phrase("₹" + String.format("%.2f", total),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, successColor)));
        valueCell3.setBorder(Rectangle.TOP);
        valueCell3.setBorderColor(borderColor);
        valueCell3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell3.setPaddingTop(8);
        totalTable.addCell(valueCell3);

        document.add(totalTable);

        // ============================================
        // FOOTER WITH QR CODE
        // ============================================
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        LineSeparator footerLine = new LineSeparator();
        footerLine.setLineColor(borderColor);
        document.add(new Chunk(footerLine));

        // Footer table with 2 columns: Text (left) and QR Code (right)
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{3, 1});
        footerTable.setSpacingBefore(10);
        footerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        // Left: Footer text
        PdfPCell footerTextCell = new PdfPCell();
        footerTextCell.setBorder(Rectangle.NO_BORDER);
        footerTextCell.setVerticalAlignment(Element.ALIGN_BOTTOM);

        Paragraph footerText = new Paragraph();
        footerText.setFont(smallFont);
        footerText.setAlignment(Element.ALIGN_LEFT);
        footerText.add("Thank you for choosing CritiMeds Consult, India!\n");
        footerText.add("For any queries, contact us at (+91) 8209857661 (Hemant Garg)\n");
        footerText.add("This is a computer-generated prescription and does not require a signature.\n");

        Chunk validityText = new Chunk("⚠️ Valid for 3 days from date of issue",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, BaseColor.RED));
        footerText.add(validityText);

        footerTextCell.addElement(footerText);
        footerTable.addCell(footerTextCell);

        // Right: QR Code
        PdfPCell qrCell = new PdfPCell();
        qrCell.setBorder(Rectangle.NO_BORDER);
        qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        qrCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
        qrCell.setPaddingLeft(10); // Add left padding for better positioning
        qrCell.setPaddingTop(2);

        try {
            // Generate QR code data
            String qrData = qrCodeService.createPrescriptionQRData(prescription.getId(), items);

            // Generate larger QR code image (120x120 instead of 100x100)
            BufferedImage qrImage = qrCodeService.generateQRCodeImage(qrData, 120, 120);

            // Convert to iText Image - larger size for better scanning
            Image qrImagePdf = Image.getInstance(qrImage, null);
            qrImagePdf.scaleAbsolute(100, 100); // Display at 100x100 (good scan quality)
            qrImagePdf.setAlignment(Element.ALIGN_CENTER); // Center the QR

            // Wrap QR in paragraph for better centering
            Paragraph qrWrapper = new Paragraph();
            qrWrapper.setAlignment(Element.ALIGN_CENTER);
            qrWrapper.add(new Chunk(qrImagePdf, 0, 0));
            qrCell.addElement(qrWrapper);

            // Add label directly below QR - perfectly centered
            Paragraph scanLabel = new Paragraph("Scan to Verify",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, BaseColor.DARK_GRAY));
            scanLabel.setAlignment(Element.ALIGN_CENTER);
            scanLabel.setSpacingBefore(2); // Minimal spacing
            qrCell.addElement(scanLabel);

        } catch (Exception e) {
            System.err.println("Failed to generate QR code: " + e.getMessage());
            e.printStackTrace();

            Paragraph errorMsg = new Paragraph("QR Code\nUnavailable",
                    FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.GRAY));
            errorMsg.setAlignment(Element.ALIGN_CENTER);
            qrCell.addElement(errorMsg);
        }

        footerTable.addCell(qrCell);
        document.add(footerTable);

        document.close();
        writer.close();

        return baos.toByteArray();
    }
}