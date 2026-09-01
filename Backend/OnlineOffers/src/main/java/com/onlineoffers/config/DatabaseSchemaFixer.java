package com.onlineoffers.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DatabaseSchemaFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Checking and fixing database schema constraints...");
            // Drop old/legacy orphan column primary_image if it exists in product_images
            jdbcTemplate.execute("ALTER TABLE IF EXISTS product_images DROP COLUMN IF EXISTS primary_image;");
            log.info("Database schema check completed successfully.");
        } catch (Exception e) {
            log.warn("Note during database schema cleanup: {}", e.getMessage());
        }
    }
}
