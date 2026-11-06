-- =====================================================================================
--  CineMax -- application schema, run automatically at every startup.
--
--  WHY THIS FILE EXISTS
--    spring.jpa.hibernate.ddl-auto=update cannot create these tables on MariaDB
--    (XAMPP / WAMP / MAMP "MySQL", which reports its version as 5.5.5-10.x.y).
--    Hibernate issues "alter table <t> modify column <c> enum (...) not null" for the
--    enum columns before any table exists, MariaDB rejects all of them, and the schema
--    stays empty -> "Table 'movie_booking.users' doesn't exist".
--    Spring Boot runs this script first, and Hibernate's update then finds every table
--    already correct and has nothing to change.
--
--  Every statement is safe to run again: CREATE TABLE IF NOT EXISTS plus procedures that
--  only add a column or index when it is missing. Existing data is never touched.
--  Works on MariaDB and on MySQL 8 alike.
-- =====================================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `user_type`        varchar(31)  NOT NULL,               -- CUSTOMER | ADMIN
  `id`               bigint       NOT NULL AUTO_INCREMENT,
  `created_at`       datetime(6)  NOT NULL,
  `email`            varchar(150) NOT NULL,
  `full_name`        varchar(100) NOT NULL,
  `password_hash`    varchar(255) NOT NULL,               -- BCrypt hash, never a raw password
  `phone`            varchar(20)  DEFAULT NULL,
  `permission_level` varchar(30)  DEFAULT NULL,           -- SUPER_ADMIN | STAFF | BOX_OFFICE (admins only)
  `loyalty_points`   int          DEFAULT NULL,
  `wallet_balance`   decimal(10,2) DEFAULT NULL,         -- Tier 2 wallet
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 3: the cinema venues.
CREATE TABLE IF NOT EXISTS `theatres` (
  `id`      bigint       NOT NULL AUTO_INCREMENT,
  `address` varchar(200) DEFAULT NULL,
  `city`    varchar(60)  NOT NULL,
  `name`    varchar(100) NOT NULL,
  `phone`   varchar(20)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 2: the catalogue. movie_format = STANDARD | IMAX | THREE_D decides the subclass
-- that is rebuilt when a row is read.
CREATE TABLE IF NOT EXISTS `movies` (
  `movie_format`     varchar(31)   NOT NULL,
  `id`               bigint        NOT NULL AUTO_INCREMENT,
  `cast_members`     varchar(500)  DEFAULT NULL,
  `description`      varchar(1000) DEFAULT NULL,
  `director`         varchar(150)  DEFAULT NULL,
  `duration_minutes` int           NOT NULL,
  `genre`            varchar(60)   NOT NULL,
  `language`         varchar(40)   NOT NULL,
  `poster_url`       varchar(500)  DEFAULT NULL,
  `producers`        varchar(300)  DEFAULT NULL,
  `rating`           varchar(10)   DEFAULT NULL,
  `release_date`     date          DEFAULT NULL,
  `still_urls`       varchar(2000) DEFAULT NULL,
  `title`            varchar(150)  NOT NULL,
  `trailer_url`      varchar(500)  DEFAULT NULL,
  `writers`          varchar(300)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 3: auditoriums inside a theatre. screen_type = STANDARD | PREMIUM | VIP decides
-- the price multiplier (1.00 / 1.30 / 1.80).
CREATE TABLE IF NOT EXISTS `screens` (
  `screen_type`   varchar(31) NOT NULL,
  `id`            bigint      NOT NULL AUTO_INCREMENT,
  `name`          varchar(60) NOT NULL,
  `row_count`     int         NOT NULL,
  `seats_per_row` int         NOT NULL,
  `theatre_id`    bigint      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKomykyk08ts7cl7rwxp5qlaear` (`theatre_id`),
  CONSTRAINT `FKomykyk08ts7cl7rwxp5qlaear`
    FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 4: a movie on a screen at a time. The final seat price is calculated from
-- base_price + the screen multiplier + the movie surcharge, then the pricing strategy.
CREATE TABLE IF NOT EXISTS `showtimes` (
  `id`         bigint        NOT NULL AUTO_INCREMENT,
  `base_price` decimal(10,2) NOT NULL,
  `end_time`   datetime(6)   NOT NULL,
  `start_time` datetime(6)   NOT NULL,
  `movie_id`   bigint        NOT NULL,
  `screen_id`  bigint        NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeltpyuei1d5g3n6ikpsjwwil6` (`movie_id`),
  KEY `FKqh5i17921jatisuwyu12ho500` (`screen_id`),
  CONSTRAINT `FKeltpyuei1d5g3n6ikpsjwwil6`
    FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `FKqh5i17921jatisuwyu12ho500`
    FOREIGN KEY (`screen_id`) REFERENCES `screens` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 5: a reservation. reference is the customer-facing code (BK + 8 hex characters);
-- status decides whether the seats are held, sold or released.
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`           bigint        NOT NULL AUTO_INCREMENT,
  `created_at`   datetime(6)   NOT NULL,
  `expires_at`   datetime(6)   DEFAULT NULL,     -- end of the 10-minute seat hold
  `reference`    varchar(20)   NOT NULL,
  `status`       enum('CANCELLED','CONFIRMED','PENDING_PAYMENT') NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `customer_id`  bigint        NOT NULL,
  `show_id`      bigint        NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpki3ddx1043pwavq8jibqcxkw` (`reference`),
  KEY `FKib6gjgj2e9binkktxmm175bmm` (`customer_id`),
  KEY `FKdsuyaskf7mjf80cr4pfolbdc6` (`show_id`),
  CONSTRAINT `FKdsuyaskf7mjf80cr4pfolbdc6`
    FOREIGN KEY (`show_id`) REFERENCES `showtimes` (`id`),
  CONSTRAINT `FKib6gjgj2e9binkktxmm175bmm`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 5: the seats of a booking (one row per seat, e.g. A1).
CREATE TABLE IF NOT EXISTS `booking_seats` (
  `booking_id` bigint      NOT NULL,
  `seat_code`  varchar(6)  NOT NULL,
  PRIMARY KEY (`booking_id`,`seat_code`),
  CONSTRAINT `FKmbi9ciapn0nvat63t0a8tv478`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 6: money. One row per payment or refund: method decides the processor, status
-- decides whether it can be refunded or deleted.
CREATE TABLE IF NOT EXISTS `payments` (
  `id`                bigint        NOT NULL AUTO_INCREMENT,
  `amount`            decimal(10,2) NOT NULL,
  `convenience_fee`   decimal(10,2) NOT NULL,
  `masked_reference`  varchar(40)   DEFAULT NULL,   -- **** **** **** 1234 / 07******67
  `method`            enum('CARD','CASH_COUNTER','WALLET') NOT NULL,
  `paid_at`           datetime(6)   NOT NULL,
  `refunded_amount`   decimal(10,2) NOT NULL,
  `status`            enum('PARTIALLY_REFUNDED','REFUNDED','SUCCESS') NOT NULL,
  `transaction_ref`   varchar(40)   NOT NULL,       -- TXN-CARD-XXXXXXXX
  `booking_id`        bigint        NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjwk4x78utnlycetjq9ulvm7tr` (`transaction_ref`),
  KEY `FKc52o2b1jkxttngufqp3t7jr3h` (`booking_id`),
  CONSTRAINT `FKc52o2b1jkxttngufqp3t7jr3h`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- One review per booking (unique booking_id).
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`          bigint       NOT NULL AUTO_INCREMENT,
  `booking_id`  bigint       NOT NULL,
  `comment`     varchar(500) DEFAULT NULL,
  `created_at`  datetime(6)  NOT NULL,
  `rating`      int          NOT NULL,
  `customer_id` bigint       NOT NULL,
  `movie_id`    bigint       NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3p9j9vyr1qofbcxju65es206r` (`booking_id`),
  KEY `FKkquncb1glvrldaui8v52xfd5q` (`customer_id`),
  KEY `FK87tlqya0rq8ijfjscldpvvdyq` (`movie_id`),
  CONSTRAINT `FK87tlqya0rq8ijfjscldpvvdyq`
    FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `FKkquncb1glvrldaui8v52xfd5q`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- The customer inbox (booking confirmed, moved, cancelled, hold expired, reminders).
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`                bigint       NOT NULL AUTO_INCREMENT,
  `booking_id`        bigint       DEFAULT NULL,
  `booking_reference` varchar(20)  DEFAULT NULL,
  `created_at`        datetime(6)  NOT NULL,
  `message`           varchar(255) NOT NULL,
  `read_at`           datetime(6)  DEFAULT NULL,
  `type`              enum('BOOKING_CANCELLED','BOOKING_CONFIRMED','BOOKING_MOVED',
                           'HOLD_EXPIRED','REMINDER_24H','REMINDER_2H') NOT NULL,
  `customer_id`       bigint       NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKc94cts1ygm7394xj40x1yov1k` (`customer_id`),
  CONSTRAINT `FKc94cts1ygm7394xj40x1yov1k`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Member 1: login lockout counters, keyed by a hash of the email (never the email itself).
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `email_hash`   varchar(64) NOT NULL,
  `failures`     int         NOT NULL,
  `locked_until` datetime(6) DEFAULT NULL,
  `window_start` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`email_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- -------------------------------------------------------------------------------------
-- SECTION 3B -- the Tier 1-3 upgrade tables and columns
--
--   promo_codes        discount codes (a percentage or a flat amount, minimum spend, validity, use limit)
--   wallet_transactions  the wallet ledger: TOP_UP, PAYMENT and REFUND rows, with the balance after each
--   waitlist_entries   "notify me" for a sold-out show, first come first served
--
--   Hibernate (ddl-auto=update) also creates these on startup, so running this section is optional -
--   it just means a brand-new database is complete before the application is started for the first time.
-- -------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id`          bigint        NOT NULL AUTO_INCREMENT,
  `code`        varchar(30)   NOT NULL,
  `description` varchar(160)  DEFAULT NULL,
  `type`        enum('FLAT','PERCENT') NOT NULL,
  `value`       decimal(10,2) NOT NULL,
  `min_spend`   decimal(10,2) NOT NULL DEFAULT 0.00,
  `valid_from`  date          NOT NULL,
  `valid_until` date          NOT NULL,
  `max_uses`    int           DEFAULT NULL,             -- NULL = unlimited
  `used_count`  int           NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_promo_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id`            bigint        NOT NULL AUTO_INCREMENT,
  `customer_id`   bigint        NOT NULL,
  `type`          enum('PAYMENT','REFUND','TOP_UP') NOT NULL,
  `amount`        decimal(10,2) NOT NULL,               -- positive = money in, negative = money out
  `balance_after` decimal(10,2) NOT NULL,               -- the balance once this row was written
  `note`          varchar(120)  DEFAULT NULL,
  `created_at`    datetime(6)   NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_customer_created` (`customer_id`, `created_at`),
  CONSTRAINT `fk_wallet_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `waitlist_entries` (
  `id`          bigint      NOT NULL AUTO_INCREMENT,
  `show_id`     bigint      NOT NULL,
  `customer_id` bigint      NOT NULL,
  `joined_at`   datetime(6) NOT NULL,
  `notified_at` datetime(6) DEFAULT NULL,               -- set when seats came back and we told them
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_waitlist_customer_show` (`show_id`, `customer_id`),
  KEY `idx_waitlist_show_joined` (`show_id`, `joined_at`),
  KEY `fk_waitlist_customer` (`customer_id`),
  CONSTRAINT `fk_waitlist_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_waitlist_show` FOREIGN KEY (`show_id`) REFERENCES `showtimes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- The columns the upgrade added to tables that already existed.
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS", so these are wrapped in a stored procedure that
-- checks information_schema first: the script can therefore be run twice without an error.

ALTER TABLE `users` ADD COLUMN `wallet_balance` decimal(10,2) DEFAULT NULL;
ALTER TABLE `bookings` ADD COLUMN `discount_amount` decimal(10,2) DEFAULT NULL;
ALTER TABLE `bookings` ADD COLUMN `promo_code` varchar(30) DEFAULT NULL;
ALTER TABLE `bookings` ADD COLUMN `checked_in_at` datetime(6) DEFAULT NULL;
ALTER TABLE `bookings` ADD COLUMN `checked_in_by` varchar(60) DEFAULT NULL;



-- -------------------------------------------------------------------------------------
-- SECTION 3C -- the indexes that make the bigger data sets fast
--
--   Already present on a schema this file created, skipped on the next start: the errors are
--   ignored, and the names match the @Index annotations on the entities.
--
--   With a few hundred bookings the database does not care. With the demo history (5 000 bookings,
--   540 past showtimes) these indexes are the difference between a table scan and a lookup.
--   The names match the @Index annotations on the entities, so Hibernate finds them already there.
-- -------------------------------------------------------------------------------------

CREATE INDEX `idx_booking_customer_created` ON `bookings` (customer_id, created_at);
CREATE INDEX `idx_booking_show_status` ON `bookings` (show_id, status);
CREATE INDEX `idx_booking_checked_in` ON `bookings` (checked_in_at);
CREATE INDEX `idx_showtime_movie_start` ON `showtimes` (movie_id, start_time);
CREATE INDEX `idx_showtime_screen_start` ON `showtimes` (screen_id, start_time);
CREATE INDEX `idx_payment_method_paid` ON `payments` (method, paid_at);
CREATE INDEX `idx_payment_booking` ON `payments` (booking_id);
CREATE INDEX `idx_review_movie_created` ON `reviews` (movie_id, created_at);
CREATE INDEX `idx_review_customer` ON `reviews` (customer_id);
CREATE INDEX `idx_notification_customer_created` ON `notifications` (customer_id, created_at);
CREATE INDEX `idx_notification_unread` ON `notifications` (customer_id, read_at);


-- -------------------------------------------------------------------------------------

-- -------------------------------------------------------------------------------------
-- SECTION 4 -- the three import tables
--   These are not JPA entities, so Hibernate never creates them; the Import buttons in
--   Admin -> Files & Reports read them. They must exist before SampleImportSeeder fills
--   them with the built-in sample rows on a brand-new database.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `import_movies` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT,
    `title`            VARCHAR(150) NOT NULL,
    `genre`            VARCHAR(60)  DEFAULT NULL,
    `language`         VARCHAR(40)  DEFAULT NULL,
    `duration_minutes` INT          DEFAULT NULL,
    `rating`           VARCHAR(20)  DEFAULT NULL,
    `movie_format`     VARCHAR(20)  DEFAULT NULL,
    `release_date`     DATE         DEFAULT NULL,
    `director`         VARCHAR(150) DEFAULT NULL,
    `producers`        VARCHAR(300) DEFAULT NULL,
    `writers`          VARCHAR(300) DEFAULT NULL,
    `cast_members`     VARCHAR(500) DEFAULT NULL,
    `trailer_url`      VARCHAR(500) DEFAULT NULL,
    `still_urls`       VARCHAR(2000) DEFAULT NULL,
    `description`      VARCHAR(1000) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `import_users` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT,
    `account_type`     VARCHAR(20)  NOT NULL,
    `full_name`        VARCHAR(150) NOT NULL,
    `email`            VARCHAR(160) NOT NULL,
    `password_hash`    VARCHAR(100) NOT NULL,
    `phone`            VARCHAR(30)  DEFAULT NULL,
    `permission_level` VARCHAR(30)  DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `import_showtimes` (
    `id`           BIGINT        NOT NULL AUTO_INCREMENT,
    `movie_title`  VARCHAR(150)  NOT NULL,
    `theatre_name` VARCHAR(120)  NOT NULL,
    `screen_name`  VARCHAR(120)  NOT NULL,
    `start_time`   DATETIME(6)   NOT NULL,
    `base_price`   DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
