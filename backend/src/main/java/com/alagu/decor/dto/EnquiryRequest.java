package com.alagu.decor.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record EnquiryRequest(
        @NotBlank(message = "Name is required") String name,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[0-9+\\s-]{7,15}$", message = "Enter a valid phone number")
        String phone,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,

        @NotBlank(message = "Event type is required") String eventType,

        @NotNull(message = "Event date is required")
        @FutureOrPresent(message = "Event date must be today or in the future")
        LocalDate eventDate,

        @NotBlank(message = "Location is required") String location,

        @NotNull(message = "Guest count is required")
        @Min(value = 1, message = "Guest count must be at least 1")
        Integer guestCount,

        List<String> servicesInterested,

        String message
) {}
