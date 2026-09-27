package com.alagu.decor.controller;

import com.alagu.decor.dto.ApiResponse;
import com.alagu.decor.dto.LoginRequest;
import com.alagu.decor.dto.LoginResponse;
import com.alagu.decor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Logged in successfully", authService.login(request));
    }
}
