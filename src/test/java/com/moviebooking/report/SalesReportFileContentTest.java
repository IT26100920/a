package com.moviebooking.report;

import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import com.moviebooking.report.dto.ReportDto.DayPoint;
import com.moviebooking.report.dto.ReportDto.MethodRow;
import com.moviebooking.report.dto.ReportDto.MovieRow;
import com.moviebooking.report.dto.ReportDto.SalesReport;
import com.moviebooking.report.dto.ReportDto.Totals;
import com.moviebooking.report.service.ReportPdfService;
import com.moviebooking.report.service.SalesWorkbookService;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

/** Non-empty, long-range content checks for the PDF charts and Excel chart workbook. */
class SalesReportFileContentTest {

    @Test
    void longPdfUsesMonthlyChartAndKeepsRangeAndDailyDetails() throws Exception {
        SalesReport report = sampleReport(60);
        byte[] pdf = new ReportPdfService().build(report);
        PdfReader reader = new PdfReader(pdf);
        assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(2);
        String cover = PdfTextExtractor.getTextFromPage(reader, 1);
        String details = PdfTextExtractor.getTextFromPage(reader, 2);
        assertThat(cover).contains("Monthly net revenue", report.from().toString(), report.to().toString());
        assertThat(cover).contains("month(s)");
        assertThat(details).contains("Revenue by movie", "Revenue by payment method", "Daily net revenue");
        reader.close();
    }

    @Test
    void excelContainsChartObjectsAndNonEmptyChartSourceData() throws Exception {
        SalesReport report = sampleReport(14);
        byte[] bytes = new SalesWorkbookService().build(report);
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            XSSFSheet dashboard = workbook.getSheet("Dashboard");
            XSSFSheet data = workbook.getSheet("Chart data");
            assertThat(dashboard).isNotNull();
            assertThat(data).isNotNull();
            assertThat(dashboard.getRow(1).getCell(1).getStringCellValue())
                    .isEqualTo(report.from() + " to " + report.to());
            assertThat(dashboard.getDrawingPatriarch().getCharts()).hasSize(3);
            assertThat(data.getRow(1).getCell(1).getNumericCellValue()).isEqualTo(100.0);
            assertThat(data.getRow(1).getCell(5).getNumericCellValue()).isEqualTo(250.0);
            assertThat(data.getRow(1).getCell(10).getNumericCellValue()).isEqualTo(300.0);
        }
    }

    private SalesReport sampleReport(int days) {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = from.plusDays(days - 1L);
        List<DayPoint> daily = IntStream.range(0, days)
                .mapToObj(i -> new DayPoint(from.plusDays(i).toString(),
                        new BigDecimal(i % 2 == 0 ? "100.00" : "75.00"), i % 2 == 0 ? 2 : 1))
                .toList();
        return new SalesReport(from, to,
                new Totals(new BigDecimal("350.00"), new BigDecimal("50.00"), new BigDecimal("300.00"),
                        new BigDecimal("10.00"), 2, 3, 2, 0, days, 37.5),
                daily,
                List.of(new MovieRow("Sample Feature", new BigDecimal("250.00"), 2)),
                List.of(new MethodRow("CARD", 2, new BigDecimal("300.00"))));
    }
}
