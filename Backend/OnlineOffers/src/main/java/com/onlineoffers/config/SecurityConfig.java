package com.onlineoffers.config;

import com.onlineoffers.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(Customizer.withDefaults())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https:; frame-ancestors 'none';"
                        ))
                        .permissionsPolicy(pp -> pp.policy("camera=(), microphone=(), geolocation=(), payment=(), usb=()"))
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. CORS Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Read-only Public Customer Endpoints (GET & HEAD)
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/marketplaces/**", "/api/clicks/**", "/uploads/**", "/api/health").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/products/**", "/api/categories/**", "/api/marketplaces/**", "/api/clicks/**", "/uploads/**", "/api/health").permitAll()

                        // 3. Admin Authentication Endpoint (Public)
                        .requestMatchers("/api/admin/auth/**").permitAll()

                        // 4. Admin & Mutation Endpoints (Requires ROLE_ADMIN or ROLE_SUPER_ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/categories/**", "/api/marketplaces/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**", "/api/marketplaces/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**", "/api/marketplaces/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                        // 5. Admin Management, Analytics, Scraper, Resolver & Telegram Endpoints
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/analytics/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/telegram/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/url/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/url-resolver/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                        // 6. Default to authenticated for all other routes
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}