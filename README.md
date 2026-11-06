# CineMax — Movie Ticket Booking

**SE1020 Object Oriented Programming project.** CineMax is a small web application for browsing movies and booking cinema seats. The classroom demo is intentionally limited to a few end-to-end flows that are straightforward to explain.

## Core demonstration

- Browse movies and view their details and showtimes.
- Choose seats and create a booking.
- Complete a simulated card payment. No real payment is processed.
- View and cancel bookings.
- Sign in as an administrator to manage movies, theatres, screens, showtimes, customers, bookings, and payments.

Reviews, waitlists, wallet/loyalty, promo codes, rescheduling, partial cancellation, door check-in, notifications, language switching, and analytics are not part of the student demo navigation. Admins can use the separate **Sales reports** option to download date-filtered PDF, Excel, or CSV exports. Some other optional source modules remain in the repository for reference; see [`docs/CORE_DEMO_SCOPE.md`](docs/CORE_DEMO_SCOPE.md).

## Requirements

- JDK 17
- Maven 3.9+ (or an IDE with Maven support)
- MySQL 8 or compatible MariaDB

## Run locally

1. Clone the project and open it in IntelliJ IDEA.
2. Start the database server. The default database name is `movie_booking`; connection values can be overridden with `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASS` environment variables.
3. Run the Spring Boot application from IntelliJ, or use:

   ```bash
   mvn spring-boot:run
   ```

4. Open [http://localhost:8080](http://localhost:8080). On first run, the application initializes the schema and sample catalog data.

The optional synthetic sales-history generator is **off by default**. To create its extra sample records for an optional analytics demonstration, set `CINEMAX_DEMO_HISTORY=true` in the run configuration.

## Main technologies

- Java 17, Spring Boot, Spring Data JPA
- MySQL/MariaDB
- HTML, CSS, and JavaScript

## Tests

Run with `mvn test`. Integration tests use MySQL and a separate test database; set `TEST_DB_HOST`, `TEST_DB_PORT`, and `TEST_DB_NAME` as needed. Tests have not been run in the sandbox used for the recent edits because Maven/JDK 17 and a MySQL service were unavailable.

The repository also contains optional report-export services and tests. The XLSX export contains charts; CSV remains plain tabular data. These exports are not exposed in the core demo navigation.

## Project scope notes

- This is a teaching/demo application. Payment is simulated and is not connected to a payment provider.
- The interface is English-only and uses the light orange theme for the core demo.
- Keep the presentation focused on code and flows your team understands; describe optional modules as optional rather than as part of the core demonstration.
