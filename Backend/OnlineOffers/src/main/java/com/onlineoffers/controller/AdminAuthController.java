package com.onlineoffers.controller;

import com.onlineoffers.dto.AdminLoginRequest;
import com.onlineoffers.dto.AdminLoginResponse;
import com.onlineoffers.exception.RateLimitExceededException;
import com.onlineoffers.security.LoginRateLimiterService;
import com.onlineoffers.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminService adminService;
    private final LoginRateLimiterService rateLimiterService;

    public AdminAuthController(AdminService adminService, LoginRateLimiterService rateLimiterService) {
        this.adminService = adminService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = extractClientIp(servletRequest);
        String rateLimitKey = clientIp + ":" + (request.getUsername() != null ? request.getUsername().trim().toLowerCase() : "unknown");

        if (rateLimiterService.isBlocked(rateLimitKey) || rateLimiterService.isBlocked(clientIp)) {
            long remainingMinutes = Math.max(
                    rateLimiterService.getRemainingLockoutMinutes(rateLimitKey),
                    rateLimiterService.getRemainingLockoutMinutes(clientIp)
            );
            throw new RateLimitExceededException("Too many failed login attempts. Please try again in " + remainingMinutes + " minutes.");
        }

        try {
            AdminLoginResponse response = adminService.login(request);
            rateLimiterService.loginSucceeded(rateLimitKey);
            rateLimiterService.loginSucceeded(clientIp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            rateLimiterService.loginFailed(rateLimitKey);
            rateLimiterService.loginFailed(clientIp);
            throw e;
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "0.0.0.0";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank()) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "0.0.0.0";
    }
}
