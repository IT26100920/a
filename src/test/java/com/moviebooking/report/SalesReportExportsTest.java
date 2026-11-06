package com.moviebooking.report;

import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import com.moviebooking.exception.BusinessException;
import com.moviebooking.report.service.ReportService;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Coverage for report date boundaries, empty periods, and the exported file contents. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SalesReportExportsTest {

    @Autowired MockMvc mvc;
    @Autowired ReportService reports;

    private MockHttpSession adminSession() throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@cinema.lk\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk()).andReturn().getRequest().getSession();
    }

    @Test
    void anEmptyRangeIsZeroFilledAndExportsTellTheReaderThereAreNoSales() throws Exception {
        LocalDate from = LocalDate.now().plusYears(5).withDayOfMonth(1);
        LocalDate to = from.plusDays(6);
        var report = reports.sales(from, to);

        assertThat(report.totals().payments()).isZero();
        assertThat(report.totals().net()).isEqualByComparingTo("0.00");
        assertThat(report.daily()).hasSize(7).allSatisfy(day ->
                assertThat(day.net()).isEqualByComparingTo("0.00"));

        MockHttpSession admin = adminSession();
        byte[] pdf = mvc.perform(get("/api/admin/reports/sales.pdf").session(admin)
                        .param("from", from.toString()).param("to", to.toString()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(from.toString())))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(pdf).startsWith("%PDF-".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        PdfReader reader = new PdfReader(pdf);
        assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(2);
        String pageOne = PdfTextExtractor.getTextFromPage(reader, 1);
        assertThat(pageOne).contains(from.toString(), to.toString(), "No payments were recorded");
        reader.close();

        byte[] xlsx = mvc.perform(get("/api/admin/reports/sales.xlsx").session(admin)
                        .param("from", from.toString()).param("to", to.toString()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(to.toString())))
                .andReturn().getResponse().getContentAsByteArray();
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(xlsx))) {
            var dashboard = workbook.getSheet("Dashboard");
            assertThat(dashboard).isNotNull();
            assertThat(dashboard.getRow(1).getCell(1).getStringCellValue())
                    .isEqualTo(from + " to " + to);
            assertThat(dashboard.getRow(14).getCell(0).getStringCellValue())
                    .contains("No payments were recorded");
            assertThat(((org.apache.poi.xssf.usermodel.XSSFSheet) dashboard)
                    .getDrawingPatriarch().getCharts()).hasSize(3);
            assertThat(workbook.getSheet("Chart data").getLastRowNum()).isEqualTo(7);
        }

        String csv = mvc.perform(get("/api/admin/reports/sales.csv").session(admin)
                        .param("from", from.toString()).param("to", to.toString()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(csv).contains("# period," + from + "," + to, "net_sales_lkr,0.00");
    }

    @Test
    void reportAllowsAtMost366CalendarDays() {
        LocalDate from = LocalDate.of(2025, 1, 1);
        assertThat(reports.sales(from, from.plusDays(365)).daily()).hasSize(366);
        assertThatThrownBy(() -> reports.sales(from, from.plusDays(366)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("366 days or less");
        assertThatThrownBy(() -> reports.sales(from.plusDays(1), from))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("on or before");
    }
}
