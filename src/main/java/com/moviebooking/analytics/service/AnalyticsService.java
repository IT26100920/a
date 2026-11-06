package com.moviebooking.analytics.service;

import com.moviebooking.analytics.dto.AnalyticsDto.AnalyticsResponse;
import com.moviebooking.analytics.dto.AnalyticsDto.Funnel;
import com.moviebooking.analytics.dto.AnalyticsDto.Metric;
import com.moviebooking.analytics.dto.AnalyticsDto.Slice;
import com.moviebooking.analytics.dto.AnalyticsDto.Summary;
import com.moviebooking.booking.entity.BookingStatus;
import com.moviebooking.booking.repository.BookingRepository;
import com.moviebooking.payment.repository.PaymentRepository;
import com.moviebooking.show.repository.ShowtimeRepository;
import com.moviebooking.user.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Analytics for the admin dashboard: where the money comes from, when the seats sell, and how many of the
 * people who held a seat actually paid and turned up.
 *
 * <p>Everything is counted from the tables rather than from a cached summary, so the page is correct right
 * after a booking, a refund or a scan. Money is counted on the day the payment was taken, and payments on
 * cancelled bookings are left out — the same rule the sales report uses, so the figures always agree.</p>
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final PaymentRepository payments;
    private final BookingRepository bookings;
    private final ShowtimeRepository showtimes;
    private final CustomerRepository customers;

    public AnalyticsService(PaymentRepository payments, BookingRepository bookings, ShowtimeRepository showtimes,
                            CustomerRepository customers) {
        this.payments = payments;
        this.bookings = bookings;
        this.showtimes = showtimes;
        this.customers = customers;
    }

    /** Builds the whole page for the last {@code days} days (default 7, at most 365). */
    public AnalyticsResponse build(int days) {
        int window = Math.min(365, Math.max(1, days));
        LocalDate today = LocalDate.now();
        LocalDateTime since = today.minusDays(window - 1L).atStartOfDay();
        // The period immediately before this one, of the same length, so every card can show a change.
        LocalDateTime previousSince = since.minusDays(window);
        LocalDateTime previousUntil = since;

        List<BookingStatus> paid = BookingStatus.paidStatuses();
        BigDecimal revenue = BigDecimal.ZERO;
        long tickets = 0;
        List<Slice> byMovie = new ArrayList<>();
        for (Object[] row : payments.revenueByMovie(paid, since)) {
            BigDecimal net = (BigDecimal) row[1];
            revenue = revenue.add(net);
            tickets += row[3] == null ? 0 : ((Number) row[3]).longValue();
            byMovie.add(new Slice((String) row[0], scale(net), ((Number) row[2]).longValue()));
        }

        List<Slice> byScreen = payments.revenueByScreen(paid, since).stream()
                .map(r -> new Slice((String) r[0], scale((BigDecimal) r[1]), ((Number) r[2]).longValue()))
                .toList();

        List<Slice> byDay = payments.revenueByDay(paid, since).stream()
                .map(r -> new Slice(String.valueOf(r[0]), scale((BigDecimal) r[1]), 0))
                .toList();

        List<Slice> byHour = bookings.seatsByStartHour(paid, since).stream()
                .map(r -> new Slice(String.format("%02d:00", ((Number) r[0]).intValue()),
                        BigDecimal.valueOf(((Number) r[1]).longValue()), ((Number) r[1]).longValue()))
                .toList();

        List<Slice> methods = payments.methodMix(since).stream()
                .map(r -> new Slice((String) ((Enum<?>) r[0]).name(), scale((BigDecimal) r[2]),
                        ((Number) r[1]).longValue()))
                .toList();

        long paidBookings = bookings.countByStatusSince(paid, since);
        long holds = bookings.countCreatedSince(since);
        long cancelled = bookings.countByStatusSince(List.of(BookingStatus.CANCELLED), since);
        long checkedIn = bookings.findCheckedInSince(since).size();
        double conversion = holds == 0 ? 0 : round1(paidBookings * 100.0 / holds);

        long noShows = bookings.countNoShows(LocalDateTime.now(), since);

        // The aggregate comes back as one row: [seats sold, seats on sale]. Only shows that have already
        // started count; the future ones have sold little yet and would understate the figure.
        LocalDateTime now = LocalDateTime.now();
        List<Object[]> occupancyRows = showtimes.occupancyForPeriod(paid, since, now.plusYears(1), now);
        Object[] occupancy = occupancyRows.isEmpty() ? new Object[2] : occupancyRows.get(0);
        long seatsSold = occupancy[0] == null ? 0 : ((Number) occupancy[0]).longValue();
        long seatsOnSale = occupancy[1] == null ? 0 : ((Number) occupancy[1]).longValue();
        double occupancyPercent = seatsOnSale == 0 ? 0 : round1(seatsSold * 100.0 / seatsOnSale);

        BigDecimal average = paidBookings == 0 ? BigDecimal.ZERO.setScale(2)
                : revenue.divide(BigDecimal.valueOf(paidBookings), 2, RoundingMode.HALF_UP);

        // Attendance: of the people who were expected at a show that has already started, how many were
        // actually scanned in. A percentage of confirmations, not of all bookings, so it reads like a rate.
        double attendancePercent = paidBookings == 0 ? 0 : round1(checkedIn * 100.0 / paidBookings);

        Summary summary = summary(window, since, previousSince, previousUntil, paid, revenue, tickets, paidBookings,
                average, occupancyPercent, attendancePercent, seatsSold, seatsOnSale, checkedIn, noShows);

        return new AnalyticsResponse(window, scale(revenue), tickets, paidBookings, average, occupancyPercent,
                noShows, new Funnel(holds, paidBookings, cancelled, checkedIn, conversion),
                byMovie, byScreen, byDay, byHour, methods, summary);
    }

    /**
     * Builds the headline cards. Each metric is measured over this period and over the equally long period
     * before it, and the change is expressed in percent of the earlier figure - the reading a manager
     * expects ("revenue is up 12% on the previous 7 days"). A previous figure of zero gives no percentage
     * at all rather than an infinite one.
     */
    private Summary summary(int window, LocalDateTime since, LocalDateTime previousSince, LocalDateTime previousUntil,
                            List<BookingStatus> paid, BigDecimal revenue, long tickets, long paidBookings,
                            BigDecimal average, double occupancyPercent, double attendancePercent,
                            long seatsSold, long seatsOnSale, long checkedIn, long noShows) {
        BigDecimal previousRevenue = scale(payments.revenueBetween(paid, previousSince, previousUntil));
        long previousTickets = payments.ticketsBetween(paid, previousSince, previousUntil);
        long previousBookings = bookings.countByStatusBetween(paid, previousSince, previousUntil);
        BigDecimal previousAverage = previousBookings == 0 ? BigDecimal.ZERO.setScale(2)
                : previousRevenue.divide(BigDecimal.valueOf(previousBookings), 2, RoundingMode.HALF_UP);
        long previousCheckedIn = bookings.countCheckedInBetween(previousSince, previousUntil);
        double previousAttendance = previousBookings == 0 ? 0 : round1(previousCheckedIn * 100.0 / previousBookings);

        // The seats sold and the seats on sale for the earlier window, so occupancy is compared on the
        // same basis. previousTickets is the same figure, measured through the payment rows.
        long previousSeatsSold = previousTickets;
        List<Object[]> previousOccupancyRows =
                showtimes.occupancyForPeriod(paid, previousSince, previousUntil, LocalDateTime.now());
        Object[] previousOccupancyRow = previousOccupancyRows.isEmpty() ? new Object[2] : previousOccupancyRows.get(0);
        long previousSeatsOnSale = previousOccupancyRow[1] == null ? 0
                : ((Number) previousOccupancyRow[1]).longValue();
        double previousOccupancyPercent = previousSeatsOnSale == 0 ? 0
                : round1(previousSeatsSold * 100.0 / previousSeatsOnSale);

        long newCustomers = customers.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(since))
                .count();
        long previousNewCustomers = customers.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(previousSince)
                        && c.getCreatedAt().isBefore(previousUntil))
                .count();
        long refunds = payments.refundsSince(since);

        return new Summary(
                metric("Net revenue", revenue, previousRevenue, "LKR"),
                metric("Tickets sold", BigDecimal.valueOf(tickets), BigDecimal.valueOf(previousTickets), ""),
                metric("Confirmed bookings", BigDecimal.valueOf(paidBookings), BigDecimal.valueOf(previousBookings), ""),
                metric("Average booking value", average, previousAverage, "LKR"),
                metric("Seat occupancy", BigDecimal.valueOf(occupancyPercent),
                        BigDecimal.valueOf(previousOccupancyPercent), "%"),
                metric("Attendance rate", BigDecimal.valueOf(attendancePercent),
                        BigDecimal.valueOf(previousAttendance), "%"),
                metric("New customers", BigDecimal.valueOf(newCustomers), BigDecimal.valueOf(previousNewCustomers), ""),
                refunds, noShows, seatsSold, seatsOnSale);
    }

    /** One headline metric plus its change against the earlier period. */
    private static Metric metric(String label, BigDecimal value, BigDecimal previous, String unit) {
        Double change = previous == null || previous.signum() == 0 ? null
                : round1(value.subtract(previous).doubleValue() * 100.0 / previous.doubleValue());
        return new Metric(label, scale(value), scale(previous), change, unit);
    }

    /** Today's date label, used by the dashboard header. */
    public String today() {
        return LocalDate.now().format(DAY);
    }

    private static BigDecimal scale(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private static double round1(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
