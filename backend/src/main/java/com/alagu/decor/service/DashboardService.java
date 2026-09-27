package com.alagu.decor.service;

import com.alagu.decor.dto.DashboardStatsDto;
import com.alagu.decor.repository.GalleryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private static final List<String> CATEGORY_SLUGS = List.of(
            "decorations", "event-production", "food-hospitality",
            "entertainment", "gifts", "music-and-entries", "photography"
    );

    private final GalleryItemRepository galleryItemRepository;
    private final GalleryService galleryService;
    private final EnquiryService enquiryService;

    public DashboardService(
            GalleryItemRepository galleryItemRepository,
            GalleryService galleryService,
            EnquiryService enquiryService
    ) {
        this.galleryItemRepository = galleryItemRepository;
        this.galleryService = galleryService;
        this.enquiryService = enquiryService;
    }

    public DashboardStatsDto getStats() {
        return new DashboardStatsDto(
                galleryItemRepository.count(),
                enquiryService.countAll(),
                galleryService.countsByCategory(CATEGORY_SLUGS),
                galleryService.getFeatured().stream().limit(8).toList(),
                enquiryService.getRecent(5)
        );
    }
}
