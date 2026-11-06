# CineMax — bug report and fixes

Target: `https://github.com/IT26100922/my.git`, branch `a`, commit `13c3f56`.
Verified on JDK 17.0.21 + Maven 3.9.9 against a local server on port 3306.

> **The server is MariaDB, not MySQL 8.** MariaDB is what XAMPP / WAMP / MAMP install under the
> name "MySQL"; its version string reads `5.5.5-10.x.y`. That one fact explains the two crashes in
> section 1 and is the reason the project now builds its own schema. Nothing in this report needs
> MySQL 8 — the project runs on what you already have.

---

## 1. The application did not start (🔴 blocker) — fixed

Your log ended in a stack trace. There were **two independent causes**, both now fixed.

### 1a. Unguarded `count()` on a table that did not exist

`SampleImportSeeder.count()` ran `SELECT COUNT(*)` against `import_users`, `import_movies` and
`import_showtimes` with no guard. On a database where those tables were missing it threw
`BadSqlGrammarException`, the exception escaped the Spring startup runner and killed the process.

**Fix** — `SampleImportSeeder.java`: `count()` catches `DataAccessException`, logs at `debug` and
returns `0`, so "table is missing" is treated as "table is empty" and the seeding step can recover.

### 1b. Hibernate's `ddl-auto=update` cannot create the schema on MariaDB

The decisive cause. With an empty `movie_booking` database, Hibernate emitted **only** statements like

```sql
alter table bookings modify column status
    enum ('CANCELLED','CHECKED_IN','CONFIRMED','PENDING_PAYMENT') not null
```

and never a single `create table`. MariaDB rejects each one (`Table 'movie_booking.bookings' doesn't
exist`), Hibernate logs them as warnings and carries on, so the schema stays empty and the next bean
to touch the database dies with `Table 'movie_booking.users' doesn't exist` at
`DataInitializer.java:80`.

**Fix** — new `src/main/resources/schema-mariadb.sql`, run by Spring Boot *before* Hibernate sees the
database (`spring.sql.init.mode=always`, `schema-locations=classpath:schema-mariadb.sql`,
`continue-on-error=true`). It creates all 17 tables (`CREATE TABLE IF NOT EXISTS`), the three
`import_*` tables that no JPA entity owns, the upgrade columns and the 11 indexes, then Hibernate's
`update` finds everything already correct and has nothing to do. Idempotent by construction: re-running
re-issues the column/index statements, whose "already exists" errors are ignored.

### 1c. Startup now reports instead of dying

**Fix** — `DataInitializer.run()` wraps its body in `try { seedDatabase(); } catch (RuntimeException e)`
and logs one actionable line naming the setup script. If the schema still cannot be prepared (server
down, permissions, half-created datadir) the app comes up and the message says what to run, instead of
a 400-line stack trace.

### 1d. Leftover InnoDB tablespaces in your own datadir

`Tablespace ... exists. Please DISCARD` comes from the database files, not the code, so it needs one
manual reset:

```sql
DROP DATABASE movie_booking;
```

then re-run `database/cinemax_mariadb_setup.sql` (or nothing at all — the app builds the schema on the
next start).

---

## 2. Database credentials were hard-coded (🔴) — fixed

`spring.datasource.username=root` / `password=0000` were literals, so `DB_USER` / `DB_PASS` did nothing
and any server whose root password was not `0000` answered `Access denied for user 'root'@'localhost'`.

**Fix** — both `application.properties` and `application-test.properties` now read
`${DB_USER:root}` and `${DB_PASS:}` (empty default = what XAMPP ships). Verified: the app starts with
`DB_USER=cinemax DB_PASS='Cinemax#2026'` and with no variables at all.

---

## 3. Promo codes accepted impossible discounts (🟠) — fixed

`POST /api/admin/promos` stored `PERCENT` values above 100 and negative values of either type. A 500%
code made the discount larger than the booking total and produced a negative amount due.

**Fix** — `PromoCode.requireSaneValue()` runs in the constructor and in `update()`: the value must be
greater than zero, and a `PERCENT` value may not exceed 100.

| Request | Before | After |
|---|---|---|
| `PERCENT 500` | `201` created | `400` "A percentage discount cannot be more than 100% (got 500%)" |
| `FLAT -500` | `201` created | `400` "A discount must be greater than zero (got -500)" |
| `PERCENT 100` | `201` | `201` (a free ticket is legitimate) |

---

## 4. A 100% discount produced a fake successful payment (🟠) — fixed

A booking fully covered by a promo stayed `PENDING_PAYMENT` with a total of `0.00`, and "paying" it by
card wrote a `SUCCESS` payment row for `0.00` — a payment record for money that never existed.

**Fix** — `BookingService.create()` calls `markConfirmed()` when the total is `0` or less, and
`PaymentService.pay()` rejects a booking whose total is zero. Verified: a 100%-off booking now returns
`201`, total `0.00`, status **CONFIRMED**; a card payment against it returns `400` "This booking is not
awaiting payment".

---

## 5. Promo message read "Code applied: null" (🟡) — fixed

With no description on the code, the response message concatenated a null. `PromoService` now falls
back to `"Code applied"`.

---

## 6. The live database feature was removed (per request) — done

The admin "Live database" monitor has been deleted outright rather than fixed: the page
(`static/live.html`), its endpoint (`GET /api/admin/live`, `LiveDatabaseController.java`), both sidebar
links (admin dashboard and door check-in) and its documentation entries are gone. `/api/admin/live` and
`/live.html` now answer `404`. This also settles the old issue that the page polled `/api/admin/live`
anonymously and produced a `401` every two seconds for a logged-out visitor.

## 7. Analytics tables overlapped their cards at 1024px (🟡) — fixed

The two revenue tables in the Analytics tab were laid out with no width floor and no overflow
container. On a 1024px laptop the pair of half-width cards squeezed each table to about 370px, so the
money column ran 6–11px past the card's right edge and film titles wrapped onto three lines.

Fixed by wrapping each table in a `.table-scroll` that is allowed to scroll, giving the table a
`min-width`, stacking the two cards into one column below 1180px, and adding `min-width: 0` to the grid
children — without that, a grid item's default `min-width: auto` lets a wide table push the whole card
past its column. The report tables now use a fixed layout with explicit numeric column widths, so the
title column takes whatever is left instead of being starved by the wide uppercase headers, and each
table closes with a totals row.

Verified with a Playwright audit that measures collisions, bleed past the parent and clipped cell text
at **1440 / 1024 / 820 / 420px** — 0 issues at every width, and the full 30-day report was captured at
each size to confirm it by eye.

---

## What was checked and found correct

Not everything looked at was broken. These were exercised and behaved properly: HTML escaping (XSS)
in reviews and admin tables, seat-race concurrency under parallel booking, ownership checks (another
customer's booking answers `404`, not `403`), role guards on every `/api/admin/*` route, the login
redirect whitelist, input validation on all write endpoints, and the CSV / PDF / JSON report output.

## Verification performed

- `mvn test` — **53 tests, 0 failures**.
- Empty database, only `DB_USER`/`DB_PASS` set — starts in ~60 s, creates 17 tables, seeds 45 accounts,
  6 films, 576 showtimes, 6 screens, 2 promo codes; `customer@cinema.lk` / `customer123` logs in.
- Restarted against the same database — 0 failures, row counts unchanged (idempotent).
- Started against the existing populated database — 5 001 bookings and 5 000 payments untouched, login fine.
- Started with **no** environment variables at all (plain `root` / empty password) — starts and seeds.
- Every fix in sections 2–6 re-tested over HTTP on the final build.

## Files changed

| File | Change |
|---|---|
| `src/main/resources/schema-mariadb.sql` | **new** — idempotent schema, 17 tables + columns + indexes |
| `database/cinemax_mariadb_setup.sql` | **new** — MariaDB-safe setup script (XAMPP) |
| `src/main/resources/application.properties` | credential variables, schema initialisation, docs |
| `src/test/resources/application-test.properties` | credential variables |
| `src/main/java/.../config/SampleImportSeeder.java` | guarded `count()` |
| `src/main/java/.../config/DataInitializer.java` | startup failure is logged, not fatal |
| `src/main/java/.../promo/entity/PromoCode.java` | `requireSaneValue()` |
| `src/main/java/.../promo/service/PromoService.java` | null-safe message |
| `src/main/java/.../booking/service/BookingService.java` | free bookings are confirmed |
| `src/main/java/.../payment/service/PaymentService.java` | no payment for a zero total |
| `src/main/resources/static/live.html` | **deleted** - live database feature removed |
| `src/main/java/.../report/controller/LiveDatabaseController.java` | **deleted** - `/api/admin/live` removed |
| `admin-dashboard.html`, `admin-scan.html` | "Live database" sidebar links removed |
| `README.md`, `database/README.md` | corrected setup instructions |

## How to run it

1. Open the folder in IntelliJ (**File → Open →** the unzipped folder → it is detected as a Maven
   project). Set the project SDK to **JDK 17** and let Maven finish importing.
2. Run `com.moviebooking.MovieBookingApplication`. Nothing else is required: your XAMPP server on
   port 3306 with `root` and an empty password is the default.
3. If your root password is set, add to the run configuration (*Run → Edit Configurations →
   Environment variables*): `DB_PASS=yourpassword`. Add
   `DB_DIALECT=org.hibernate.dialect.MariaDBDialect` to silence the harmless `HHH000339` warning.
4. Open http://localhost:8080 — `admin@cinema.lk` / `admin123`, `customer@cinema.lk` / `customer123`.
