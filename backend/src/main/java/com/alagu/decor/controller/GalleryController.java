package com.alagu.decor.controller;

import com.alagu.decor.dto.ApiResponse;
import com.alagu.decor.dto.GalleryItemDto;
import com.alagu.decor.service.GalleryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public, read-only gallery endpoints. Only published items are ever
 * returned here — unpublished/draft items are visible only via the
 * admin endpoints in AdminGalleryController.
 */
@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping("/featured")
    public ApiResponse<List<GalleryItemDto>> featured() {
        return ApiResponse.ok(galleryService.getFeatured());
    }

    @GetMapping("/{category}")
    public ApiResponse<List<GalleryItemDto>> byCategory(@PathVariable String category) {
        return ApiResponse.ok(galleryService.getPublishedByCategory(category));
    }

    @GetMapping("/{category}/{subcategory}")
    public ApiResponse<List<GalleryItemDto>> byCategoryAndSubcategory(
            @PathVariable String category, @PathVariable String subcategory) {
        return ApiResponse.ok(galleryService.getPublishedByCategoryAndSubcategory(category, subcategory));
    }
}
