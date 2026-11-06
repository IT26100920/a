package com.moviebooking.analytics.dto;

import java.math.BigDecimal;
import java.util.List;

/** DTOs for the admin analytics page: money, people and the funnel, in one payload. */
public final class AnalyticsDto {

    private AnalyticsDto() {
    }

    /** A bar or a point: a label and its value, plus a count where it makes sense. */
    public record Slice(
            String label,
            BigDecimal value,
            long count) {
    }

    /** Views → seat holds → paid → scanned. The top of the funnel is every booking row that was created. */
    public record Funnel(
            long seatHolds,
            long paidBookings,
            long cancelled,
            long checkedIn,
            double conversionPercent) {
    }

    /**
     * The headline figures, each with the same figure for the period immediately before it. The page uses
     * the pair to show a change ("+12.4% vs previous 7 days") instead of a number with nothing to compare to.
     */
    public record Metric(
            String label,
            BigDecimal value,
            BigDecimal previous,
            Double changePercent,
            String unit) {
    }

    /** Everything behind the headline cards, so the front page is one object rather than a dozen fields. */
    public record Summary(
            Metric revenue,
            Metric tickets,
            Metric bookings,
            Metric averageBookingValue,
            Metric occupancy,
            Metric attendance,
            Metric newCustomers,
            long refunds,
            long noShows,
            long seatsSold,
            long seatsOnSale) {
    }

    public record AnalyticsResponse(
            int days,
            BigDecimal revenue,
            long ticketsSold,
            long bookings,
            BigDecimal averageBookingValue,
            double occupancyPercent,
            long noShows,
            Funnel funnel,
            List<Slice> revenueByMovie,
            List<Slice> revenueByScreen,
            List<Slice> revenueByDay,
            List<Slice> occupancyByHour,
            List<Slice> paymentMethods,
            Summary summary) {
    }
}
