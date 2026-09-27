package com.alagu.decor.controller;

import com.alagu.decor.dto.ApiResponse;
import com.alagu.decor.dto.GalleryItemDto;
import com.alagu.decor.service.GalleryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Admin-only gallery content management. Protected by SecurityConfig
 * (requires ROLE_ADMIN via JWT). Never exposes any endpoint to create,
 * rename or delete a category/subcategory — that structure is fixed and
 * seeded once in database/schema.sql.
 */
@RestController
@RequestMapping("/api/admin/gallery")
public class AdminGalleryController {

    private final GalleryService galleryService;

    public AdminGalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping
    public ApiResponse<List<GalleryItemDto>> getAll(@RequestParam(required = false) String category) {
        return ApiResponse.ok(galleryService.adminGetAll(category));
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GalleryItemDto> create(
            @RequestParam String categorySlug,
            @RequestParam String subcategorySlug,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam(defaultValue = "true") boolean published,
            @RequestParam("image") MultipartFile image
    ) {
        return ApiResponse.ok("Gallery image published",
                galleryService.create(categorySlug, subcategorySlug, title, description, published, image));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ApiResponse<GalleryItemDto> update(
            @PathVariable Long id,
            @RequestParam String categorySlug,
            @RequestParam String subcategorySlug,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam(defaultValue = "true") boolean published,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return ApiResponse.ok("Gallery image updated",
                galleryService.update(id, categorySlug, subcategorySlug, title, description, published, image));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        galleryService.delete(id);
        return ApiResponse.ok("Gallery image removed", null);
    }
}
