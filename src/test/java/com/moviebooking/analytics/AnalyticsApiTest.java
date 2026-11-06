package com.moviebooking.analytics;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The admin analytics endpoint behind the dashboard's Analytics page. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsApiTest {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;

    @Test
    void analyticsDescribesTheMoneyTheFunnelAndTheSeats() throws Exception {
        MvcResult adminLogin = mvc.perform(post("/api/auth/admin/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@cinema.lk\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession admin = (MockHttpSession) adminLogin.getRequest().getSession();

        // One paid booking, so the numbers below cannot all be zero.
        String email = "stats-" + UUID.randomUUID() + "@cinema.lk";
        mvc.perform(post("/api/auth/customer/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Stats Test\",\"email\":\"" + email + "\",\"password\":\"password1\"}"));
        MvcResult login = mvc.perform(post("/api/auth/customer/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"password1\"}"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession customer = (MockHttpSession) login.getRequest().getSession();

        Long showId = jdbc.queryForObject("SELECT MIN(id) FROM showtimes", Long.class);
        jdbc.update("UPDATE showtimes SET start_time = ? WHERE id = ?", LocalDateTime.now().plusDays(10), showId);
        MvcResult booked = mvc.perform(post("/api/customer/bookings").session(customer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"showId\":" + showId + ",\"seatCodes\":[\"F1\",\"F2\"]}"))
                .andExpect(status().is2xxSuccessful()).andReturn();
        long bookingId = mapper.readTree(booked.getResponse().getContentAsString()).get("id").asLong();
        mvc.perform(post("/api/customer/payments").session(customer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookingId\":" + bookingId + ",\"method\":\"CARD\",\"reference\":\"4111111111111111\"}"))
                .andExpect(status().is2xxSuccessful());

        MvcResult result = mvc.perform(get("/api/admin/analytics?days=30").session(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenue").isNumber())
                .andExpect(jsonPath("$.ticketsSold").isNumber())
                .andExpect(jsonPath("$.occupancyPercent").isNumber())
                .andExpect(jsonPath("$.noShows").isNumber())
                .andExpect(jsonPath("$.funnel.seatHolds").isNumber())
                .andExpect(jsonPath("$.funnel.paidBookings").isNumber())
                .andExpect(jsonPath("$.funnel.checkedIn").isNumber())
                .andExpect(jsonPath("$.funnel.conversionPercent").isNumber())
                .andExpect(jsonPath("$.revenueByMovie").isArray())
                .andExpect(jsonPath("$.revenueByScreen").isArray())
                .andExpect(jsonPath("$.occupancyByHour").isArray())
                .andExpect(jsonPath("$.paymentMethods").isArray())
                // The headline cards carry the earlier period so the page can show a change.
                .andExpect(jsonPath("$.summary.revenue.value").isNumber())
                .andExpect(jsonPath("$.summary.revenue.previous").isNumber())
                .andExpect(jsonPath("$.summary.tickets.value").isNumber())
                .andExpect(jsonPath("$.summary.occupancy.value").isNumber())
                .andExpect(jsonPath("$.summary.attendance.value").isNumber())
                .andExpect(jsonPath("$.summary.newCustomers.value").isNumber())
                .andExpect(jsonPath("$.summary.seatsOnSale").isNumber())
                .andReturn();

        JsonNode a = mapper.readTree(result.getResponse().getContentAsString());
        assertTrue(a.get("ticketsSold").asInt() >= 2, "the two tickets just sold are counted");
        assertTrue(a.get("revenue").decimalValue().signum() > 0, "revenue is not zero after a payment");
        assertTrue(a.get("funnel").get("paidBookings").asInt() >= 1);
        assertTrue(a.get("paymentMethods").size() >= 1, "the CARD payment shows up in the method split");

        // A window of one day is also accepted, and an unknown window falls back to a sane one.
        mvc.perform(get("/api/admin/analytics?days=0").session(admin)).andExpect(status().isOk());

        // The comparison is against the period of the same length directly before this one. With no
        // payments that old, the earlier figure is zero - and a change of zero would be a lie, so the
        // endpoint reports no percentage (null) rather than dividing by zero.
        JsonNode summary = a.get("summary");
        assertTrue(summary.get("revenue").get("value").decimalValue().signum() > 0);
        JsonNode change = summary.get("revenue").get("changePercent");
        assertTrue(change == null || change.isNull() || change.isNumber(),
                "changePercent is either a number or absent, never NaN");
        // Occupancy is seats sold over the seats of shows that have already started. The booking this test
        // makes is for a show ten days out, so nothing has started yet and both sides are zero - the figure
        // must then be 0, never a division by zero.
        long seatsOnSale = summary.get("seatsOnSale").asLong();
        double occupancy = summary.get("occupancy").get("value").asDouble();
        if (seatsOnSale == 0) {
            assertTrue(occupancy == 0.0, "no started shows means 0% occupancy, not NaN");
        } else {
            assertTrue(occupancy > 0 && occupancy <= 100, "occupancy stays between 0 and 100%");
        }
    }
}
