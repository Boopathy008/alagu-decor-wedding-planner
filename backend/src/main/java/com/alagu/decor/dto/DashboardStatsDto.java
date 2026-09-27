package com.alagu.decor.dto;

import java.util.List;
import java.util.Map;

public record DashboardStatsDto(
        long totalImages,
        long totalEnquiries,
        Map<String, Long> imagesByCategory,
        List<GalleryItemDto> recentUploads,
        List<EnquiryDto> recentEnquiries
) {}
