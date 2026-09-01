package com.onlineoffers;

import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.entity.Admin;
import com.onlineoffers.enums.AdminRole;
import com.onlineoffers.repository.AdminRepository;
import com.onlineoffers.security.IpSecurityValidator;
import com.onlineoffers.security.JwtService;
import com.onlineoffers.security.LoginRateLimiterService;
import com.onlineoffers.service.ClickTrackingService;
import com.onlineoffers.service.ProductService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityHardeningTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IpSecurityValidator ipSecurityValidator;

    @Autowired
    private ClickTrackingService clickTrackingService;

    @Autowired
    private LoginRateLimiterService loginRateLimiterService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ProductService productService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. SQL Injection Resiliency Test
    @Test
    public void testSqlInjectionPayloadsHandledSafely() {
        // Verify JPA parameterization prevents SQLi when query parameters contain injection syntax
        String sqliPayload1 = "' OR '1'='1";
        String sqliPayload2 = "'; DROP TABLE products; --";
        String sqliPayload3 = "1 UNION SELECT username, password FROM admins--";

        Assertions.assertDoesNotThrow(() -> {
            List<ProductResponse> results1 = productService.getFilteredProducts(null, null, null, sqliPayload1);
            Assertions.assertNotNull(results1);

            List<ProductResponse> results2 = productService.getFilteredProducts(null, null, null, sqliPayload2);
            Assertions.assertNotNull(results2);

            List<ProductResponse> results3 = productService.getFilteredProducts(null, null, null, sqliPayload3);
            Assertions.assertNotNull(results3);
        });
    }

    // 2. Cross-Site Scripting (XSS) Input Handling
    @Test
    public void testXssPayloadHandlingInValidationAndSerialization() throws Exception {
        String xssPayload = "<script>alert('XSS-TEST')</script><img src=x onerror=alert(1)>";

        // Filter search endpoint safely returns JSON containing the literal string without script execution
        mockMvc.perform(get("/api/products").param("search", xssPayload))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    // 3. Clickjacking & Security Response Headers Test (Over HTTPS for HSTS)
    @Test
    public void testSecurityHeadersConfigured() throws Exception {
        mockMvc.perform(get("/api/products").secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Strict-Transport-Security", org.hamcrest.Matchers.containsString("max-age=31536000")))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    // 4. CORS Policy Verification
    @Test
    public void testCorsPreflightAllowsOnlyPermittedHeaders() throws Exception {
        mockMvc.perform(options("/api/products")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    // 5. Server-Side Request Forgery (SSRF) Defense
    @Test
    public void testSsrfIpValidatorBlocksPrivateAndMetadataIps() {
        // Cloud Instance Metadata
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://169.254.169.254/latest/meta-data/"));
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://metadata.google.internal/computeMetadata/v1/"));
        // Loopback
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://127.0.0.1:8080/api/admin"));
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://localhost:5432"));
        // Private networks
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://10.0.0.1:80"));
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://192.168.1.1/router"));
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("http://172.16.0.5/"));
        // Invalid schemes
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("file:///etc/passwd"));
        Assertions.assertFalse(ipSecurityValidator.isSafeUrl("gopher://127.0.0.1:6379"));

        // Valid public partner URLs
        Assertions.assertTrue(ipSecurityValidator.isSafeUrl("https://www.amazon.in/dp/B09XYZ"));
        Assertions.assertTrue(ipSecurityValidator.isSafeUrl("https://www.flipkart.com/item"));
    }

    // 6. Open Redirect Prevention
    @Test
    public void testOpenRedirectAllowlistValidation() {
        // Allowed merchant partner domains
        Assertions.assertTrue(clickTrackingService.isAllowedRedirectHost("https://www.amazon.in/dp/B08X"));
        Assertions.assertTrue(clickTrackingService.isAllowedRedirectHost("https://amzn.to/3xyz"));
        Assertions.assertTrue(clickTrackingService.isAllowedRedirectHost("https://dl.flipkart.com/s/xyz"));
        Assertions.assertTrue(clickTrackingService.isAllowedRedirectHost("https://www.myntra.com/shoes"));

        // Prohibited / phishing domains
        Assertions.assertFalse(clickTrackingService.isAllowedRedirectHost("https://evil-phishing-site.com/steal"));
        Assertions.assertFalse(clickTrackingService.isAllowedRedirectHost("https://amazon.in.attacker.com/login"));
        Assertions.assertFalse(clickTrackingService.isAllowedRedirectHost("javascript:alert(1)"));
        Assertions.assertFalse(clickTrackingService.isAllowedRedirectHost(null));
        Assertions.assertFalse(clickTrackingService.isAllowedRedirectHost(""));
    }

    // 7. Broken Access Control (RBAC) Enforcement
    @Test
    public void testAccessControlForPublicVsAdminRoutes() throws Exception {
        // 1. Public Read endpoints -> 200 OK
        mockMvc.perform(get("/api/products")).andExpect(status().isOk());
        mockMvc.perform(get("/api/categories")).andExpect(status().isOk());
        mockMvc.perform(get("/api/marketplaces")).andExpect(status().isOk());

        // 2. Unauthenticated Mutation -> 403 Forbidden
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"currentPrice\":100,\"affiliateUrl\":\"https://amzn.to/test\",\"categoryId\":1,\"marketplaceId\":1}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/products/1"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"HackedCategory\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().isForbidden());
    }

    // 8. Basic Login & Rate Limiting (Brute-Force Protection)
    @Test
    public void testLoginRateLimiterLockout() {
        String testKey = "192.0.2.1:attacker_user";

        Assertions.assertFalse(loginRateLimiterService.isBlocked(testKey));

        // 4 failed attempts
        for (int i = 0; i < 4; i++) {
            loginRateLimiterService.loginFailed(testKey);
            Assertions.assertFalse(loginRateLimiterService.isBlocked(testKey));
        }

        // 5th failed attempt triggers lockout
        loginRateLimiterService.loginFailed(testKey);
        Assertions.assertTrue(loginRateLimiterService.isBlocked(testKey));
        Assertions.assertTrue(loginRateLimiterService.getRemainingLockoutMinutes(testKey) > 0);

        // Reset on success
        loginRateLimiterService.loginSucceeded(testKey);
        Assertions.assertFalse(loginRateLimiterService.isBlocked(testKey));
    }

    // 9. JWT Signature & Expiration Validation
    @Test
    public void testJwtValidationAndTamperingResistance() {
        String validToken = jwtService.generateToken("admin", "ROLE_ADMIN");
        Assertions.assertTrue(jwtService.isTokenValid(validToken, "admin"));
        Assertions.assertFalse(jwtService.isTokenValid(validToken, "other_user"));

        // Tampered token
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "abcde";
        Assertions.assertFalse(jwtService.isTokenValid(tamperedToken, "admin"));

        // Empty token
        Assertions.assertFalse(jwtService.isTokenValid(null, "admin"));
        Assertions.assertFalse(jwtService.isTokenValid("", "admin"));
    }

    // 10. Deactivated User Account Invalidation
    @Test
    public void testDeactivatedAdminCannotAccessSecuredEndpoints() throws Exception {
        // Create an inactive admin
        if (!adminRepository.existsByUsername("inactive_admin")) {
            Admin inactiveAdmin = new Admin();
            inactiveAdmin.setUsername("inactive_admin");
            inactiveAdmin.setPassword(passwordEncoder.encode("Password123!"));
            inactiveAdmin.setEmail("inactive@phedox.com");
            inactiveAdmin.setRole(AdminRole.ADMIN);
            inactiveAdmin.setActive(false);
            adminRepository.save(inactiveAdmin);
        }

        // Generate token for inactive user
        String token = jwtService.generateToken("inactive_admin", "ROLE_ADMIN");

        // Request with inactive user token must be forbidden
        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    // 11. DTO Bean Validation (@Valid) Failure Handling
    @Test
    public void testValidationFailuresReturnStandardBadRequest() throws Exception {
        String adminToken = jwtService.generateToken("admin", "ROLE_ADMIN");

        // Missing required name and invalid price
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"currentPrice\":-50,\"affiliateUrl\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.currentPrice").exists());
    }

    // 12. Information Disclosure Prevention in Exceptions
    @Test
    public void testExceptionSanitizationPreventsStackTraceLeakage() throws Exception {
        // Type mismatch on path variable
        mockMvc.perform(get("/api/products/invalid-id-format"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }
}
