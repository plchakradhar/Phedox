package com.onlineoffers;

import com.onlineoffers.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class OnlineOffersApplication {

    private static final Logger log = LoggerFactory.getLogger(OnlineOffersApplication.class);

    @Value("${admin.initial.username:admin}")
    private String initialAdminUsername;

    @Value("${admin.initial.password:}")
    private String initialAdminPassword;

    @Value("${admin.initial.email:admin@phedox.local}")
    private String initialAdminEmail;

    public static void main(String[] args) {
        SpringApplication.run(OnlineOffersApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(AdminService adminService) {
        return args -> {
            if (initialAdminPassword != null && !initialAdminPassword.isBlank()) {
                adminService.createInitialAdminIfNotExist(initialAdminUsername, initialAdminPassword, initialAdminEmail);
                log.info("Initial admin account bootstrap verified for username: {}", initialAdminUsername);
            } else {
                log.info("Initial admin bootstrap skipped (INITIAL_ADMIN_PASSWORD not set)");
            }
        };
    }
}
