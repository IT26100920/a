package com.moviebooking.report.service;

import com.moviebooking.report.dto.ReportDto.DayPoint;
import com.moviebooking.report.dto.ReportDto.MethodRow;
import com.moviebooking.report.dto.ReportDto.MovieRow;
import com.moviebooking.report.dto.ReportDto.SalesReport;
import com.moviebooking.report.dto.ReportDto.Totals;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.AxisCrosses;
import org.apache.poi.xddf.usermodel.chart.AxisPosition;
import org.apache.poi.xddf.usermodel.chart.BarDirection;
import org.apache.poi.xddf.usermodel.chart.ChartTypes;
import org.apache.poi.xddf.usermodel.chart.LegendPosition;
import org.apache.poi.xddf.usermodel.chart.XDDFBarChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryAxis;
import org.apache.poi.xddf.usermodel.chart.XDDFChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFChartLegend;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSourcesFactory;
import org.apache.poi.xddf.usermodel.chart.XDDFNumericalDataSource;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryDataSource;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Creates a styled Excel report with editable source data and native, editable charts. */
@Service
public class SalesWorkbookService {

    public byte[] build(SalesReport report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet dashboard = workbook.createSheet("Dashboard");
            XSSFSheet data = workbook.createSheet("Chart data");
            dashboard.setDisplayGridlines(false);
            data.setDisplayGridlines(false);

            CellStyle title = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 20);
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            title.setFont(titleFont);
            title.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            title.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle header = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            header.setFont(headerFont);
            header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle money = workbook.createCellStyle();
            DataFormat fmt = workbook.createDataFormat();
            money.setDataFormat(fmt.getFormat("#,##0.00"));
            CellStyle metric = workbook.createCellStyle();
            Font metricFont = workbook.createFont();
            metricFont.setBold(true);
            metricFont.setFontHeightInPoints((short) 12);
            metric.setFont(metricFont);
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(fmt.getFormat("yyyy-mm-dd"));

            Row r0 = dashboard.createRow(0);
            r0.createCell(0).setCellValue("CineMax | Sales report");
            r0.getCell(0).setCellStyle(title);
            dashboard.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
            Row r1 = dashboard.createRow(1);
            r1.createCell(0).setCellValue("Reporting period");
            r1.createCell(1).setCellValue(report.from() + " to " + report.to());
            r1.createCell(4).setCellValue("Currency");
            r1.createCell(5).setCellValue("LKR");

            Totals t = report.totals();
            String[][] labels = {
                    {"Net sales (LKR)", t.net().toPlainString()}, {"Gross sales (LKR)", t.gross().toPlainString()},
                    {"Refunds (LKR)", t.refunds().toPlainString()}, {"Convenience fees (LKR)", t.fees().toPlainString()},
                    {"Tickets sold", Long.toString(t.tickets())}, {"Payments", Long.toString(t.payments())},
                    {"Confirmed bookings", Long.toString(t.confirmedBookings())},
                    {"Cancelled bookings", Long.toString(t.cancelledBookings())},
                    {"Seat occupancy (%)", Double.toString(t.occupancyPercent())},
                    {"Showtimes", Long.toString(t.showCount())}
            };
            for (int i = 0; i < labels.length; i++) {
                Row row = dashboard.createRow(i + 3);
                row.createCell(0).setCellValue(labels[i][0]);
                row.getCell(0).setCellStyle(header);
                Cell value = row.createCell(1);
                value.setCellValue(Double.parseDouble(labels[i][1]));
                value.setCellStyle(metric);
                if (i < 4) value.setCellStyle(money);
            }
            if (t.payments() == 0) {
                Row emptyNote = dashboard.createRow(14);
                emptyNote.createCell(0).setCellValue(
                        "No payments were recorded in this date range. Change the selected dates to include sales.");
                dashboard.addMergedRegion(new CellRangeAddress(14, 14, 0, 2));
            }
            dashboard.setColumnWidth(0, 28 * 256);
            dashboard.setColumnWidth(1, 20 * 256);
            for (int c = 2; c < 14; c++) dashboard.setColumnWidth(c, 14 * 256);

            // Data sheet keeps all chart sources available for filtering/editing.
            writeDaily(data, report.daily(), header, money, dateStyle);
            writeMovies(data, report.byMovie(), header, money);
            writeMethods(data, report.byMethod(), header, money);
            XSSFDrawing drawing = dashboard.createDrawingPatriarch();
            addDailyChart(drawing, data, report.daily().size());
            addMovieChart(drawing, data, report.byMovie().size());
            addMethodChart(drawing, data, report.byMethod().size());

            dashboard.createFreezePane(0, 3);
            data.createFreezePane(0, 1);
            workbook.setActiveSheet(0);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Could not build the Excel sales report: " + e.getMessage(), e);
        }
    }

    private void writeDaily(Sheet sheet, List<DayPoint> rows, CellStyle header, CellStyle money, CellStyle dateStyle) {
        Row h = sheet.createRow(0);
        headers(h, header, "Date", "Net revenue (LKR)", "Tickets");
        for (int i = 0; i < rows.size(); i++) {
            DayPoint p = rows.get(i);
            Row r = sheet.createRow(i + 1);
            Cell date = r.createCell(0);
            date.setCellValue(java.sql.Date.valueOf(LocalDate.parse(p.date())));
            date.setCellStyle(dateStyle);
            Cell amount = r.createCell(1);
            amount.setCellValue(p.net().doubleValue());
            amount.setCellStyle(money);
            r.createCell(2).setCellValue(p.tickets());
        }
        widths(sheet, 0, 18, 1, 22, 2, 14);
    }

    private void writeMovies(Sheet sheet, List<MovieRow> rows, CellStyle header, CellStyle money) {
        Row h = sheet.getRow(0);
        headers(h, header, "Date", "Net revenue (LKR)", "Tickets", "", "Movie", "Net revenue (LKR)", "Tickets");
        for (int i = 0; i < rows.size(); i++) {
            MovieRow p = rows.get(i);
            Row r = sheet.getRow(i + 1);
            if (r == null) r = sheet.createRow(i + 1);
            r.createCell(4).setCellValue(p.title());
            Cell amount = r.createCell(5);
            amount.setCellValue(p.net().doubleValue());
            amount.setCellStyle(money);
            r.createCell(6).setCellValue(p.tickets());
        }
        widths(sheet, 4, 32, 5, 22, 6, 14);
    }

    private void writeMethods(Sheet sheet, List<MethodRow> rows, CellStyle header, CellStyle money) {
        Row h = sheet.getRow(0);
        headers(h, header, "Date", "Net revenue (LKR)", "Tickets", "", "Movie", "Net revenue (LKR)", "Tickets",
                "", "Payment method", "Payments", "Amount (LKR)");
        for (int i = 0; i < rows.size(); i++) {
            MethodRow p = rows.get(i);
            Row r = sheet.getRow(i + 1);
            if (r == null) r = sheet.createRow(i + 1);
            r.createCell(8).setCellValue(p.method());
            r.createCell(9).setCellValue(p.count());
            Cell amount = r.createCell(10);
            amount.setCellValue(p.amount().doubleValue());
            amount.setCellStyle(money);
        }
        widths(sheet, 8, 24, 9, 14, 10, 22);
    }

    private void addDailyChart(XSSFDrawing drawing, XSSFSheet data, int size) {
        XSSFChart chart = chart(drawing, 3, 3, 11, 18, "Daily net revenue");
        if (size == 0) return;
        XDDFCategoryAxis cat = chart.createCategoryAxis(AxisPosition.BOTTOM);
        XDDFChartData dataSet = chart.createData(ChartTypes.BAR, cat, chart.createValueAxis(AxisPosition.LEFT));
        ((XDDFBarChartData) dataSet).setBarDirection(BarDirection.COL);
        dataSet.addSeries(
                XDDFDataSourcesFactory.fromStringCellRange(data, new CellRangeAddress(1, size, 0, 0)),
                XDDFDataSourcesFactory.fromNumericCellRange(data, new CellRangeAddress(1, size, 1, 1)));
        chart.plot(dataSet);
    }

    private void addMovieChart(XSSFDrawing drawing, XSSFSheet data, int size) {
        XSSFChart chart = chart(drawing, 0, 20, 7, 36, "Net sales by movie");
        if (size == 0) return;
        XDDFCategoryAxis cat = chart.createCategoryAxis(AxisPosition.BOTTOM);
        XDDFChartData dataSet = chart.createData(ChartTypes.BAR, cat, chart.createValueAxis(AxisPosition.LEFT));
        ((XDDFBarChartData) dataSet).setBarDirection(BarDirection.BAR);
        dataSet.addSeries(
                XDDFDataSourcesFactory.fromStringCellRange(data, new CellRangeAddress(1, size, 4, 4)),
                XDDFDataSourcesFactory.fromNumericCellRange(data, new CellRangeAddress(1, size, 5, 5)));
        chart.plot(dataSet);
    }

    private void addMethodChart(XSSFDrawing drawing, XSSFSheet data, int size) {
        XSSFChart chart = chart(drawing, 7, 20, 14, 36, "Payments by method");
        if (size == 0) return;
        XDDFChartData dataSet = chart.createData(ChartTypes.PIE, null, null);
        dataSet.addSeries(
                XDDFDataSourcesFactory.fromStringCellRange(data, new CellRangeAddress(1, size, 8, 8)),
                XDDFDataSourcesFactory.fromNumericCellRange(data, new CellRangeAddress(1, size, 10, 10)));
        chart.plot(dataSet);
        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.BOTTOM);
    }

    private XSSFChart chart(XSSFDrawing drawing, int c1, int r1, int c2, int r2, String title) {
        XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, c1, r1, c2, r2);
        XSSFChart chart = drawing.createChart(anchor);
        chart.setTitleText(title);
        chart.setTitleOverlay(false);
        return chart;
    }

    private void headers(Row row, CellStyle style, String... values) {
        for (int i = 0; i < values.length; i++) {
            Cell c = row.createCell(i);
            c.setCellValue(values[i]);
            if (!values[i].isBlank()) c.setCellStyle(style);
        }
    }

    private void widths(Sheet sheet, int c1, int w1, int c2, int w2, int c3, int w3) {
        sheet.setColumnWidth(c1, w1 * 256);
        sheet.setColumnWidth(c2, w2 * 256);
        sheet.setColumnWidth(c3, w3 * 256);
    }
}
