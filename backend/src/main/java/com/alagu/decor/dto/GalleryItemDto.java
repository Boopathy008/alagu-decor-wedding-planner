package com.alagu.decor.dto;

import java.time.Instant;

public record GalleryItemDto(
        Long id,
        String categorySlug,
        String subcategorySlug,
        String subcategoryName,
        String title,
        String description,
        String imageUrl,
        boolean published,
        Instant createdAt
) {}
