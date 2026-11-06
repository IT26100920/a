# Core student-demo scope

The classroom demo intentionally presents a small, explainable booking system rather than every optional module in the repository.

## Demonstrate

1. Browse the movie list and movie details.
2. Select a theatre/showtime and choose seats.
3. Create a booking and complete the simulated card payment.
4. View or cancel a booking.
5. Sign in as an administrator and perform CRUD on movies, theatres, screens, showtimes, customers, bookings, and payments.

## Not in the core demo navigation

Reviews, waitlists, wallet/loyalty, promo codes, seat rescheduling/partial cancellation, door scanning, notifications/email, language switching, and analytics are optional modules. Their source is retained so the app stays buildable. A separate **Sales reports** admin section is available for date-filtered PDF, Excel, and CSV exports; it does not expose the analytics dashboard or file-import tools.

The application no longer creates synthetic historical sales by default. Set `CINEMAX_DEMO_HISTORY=true` in the run configuration only when you deliberately want the optional analytics demo data.

## Suggested presentation

Use a few sample movies and showtimes. Demonstrate one complete booking with a customer account and one short admin CRUD task. Explain the entity relationships and the role of each service/repository from the code your team actually understands. Do not present the simulated card payment as a real payment gateway.
