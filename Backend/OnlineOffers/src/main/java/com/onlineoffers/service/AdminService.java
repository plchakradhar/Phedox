package com.onlineoffers.service;

import com.onlineoffers.dto.AdminLoginRequest;
import com.onlineoffers.dto.AdminLoginResponse;
import com.onlineoffers.entity.Admin;
import com.onlineoffers.enums.AdminRole;
import com.onlineoffers.exception.UnauthorizedException;
import com.onlineoffers.repository.AdminRepository;
import com.onlineoffers.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (Boolean.FALSE.equals(admin.getActive())) {
            throw new UnauthorizedException("Admin account is deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        String role = admin.getRole() != null ? admin.getRole().name() : "ROLE_ADMIN";
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        String token = jwtService.generateToken(admin.getUsername(), role);

        return new AdminLoginResponse(token, admin.getUsername(), role);
    }

    @Transactional
    public void createInitialAdminIfNotExist(String username, String rawPassword, String email) {
        if (!adminRepository.existsByUsername(username)) {
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setEmail(email);
            admin.setRole(AdminRole.SUPER_ADMIN);
            admin.setActive(true);
            adminRepository.save(admin);
        }
    }
}
