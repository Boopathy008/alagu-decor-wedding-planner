package com.alagu.decor.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record EnquiryDto(
        Long id,
        String name,
        String phone,
        String email,
        String eventType,
        LocalDate eventDate,
        String location,
        Integer guestCount,
        List<String> servicesInterested,
        String message,
        Instant createdAt,
        String status
) {}
