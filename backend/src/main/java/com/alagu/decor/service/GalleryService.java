package com.alagu.decor.service;

import com.alagu.decor.dto.GalleryItemDto;
import com.alagu.decor.entity.GalleryCategory;
import com.alagu.decor.entity.GalleryItem;
import com.alagu.decor.entity.GallerySubcategory;
import com.alagu.decor.exception.ApiException;
import com.alagu.decor.exception.ResourceNotFoundException;
import com.alagu.decor.repository.GalleryCategoryRepository;
import com.alagu.decor.repository.GalleryItemRepository;
import com.alagu.decor.repository.GallerySubcategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    private final GalleryItemRepository galleryItemRepository;
    private final GalleryCategoryRepository categoryRepository;
    private final GallerySubcategoryRepository subcategoryRepository;
    private final CloudinaryService cloudinaryService;

    public GalleryService(
            GalleryItemRepository galleryItemRepository,
            GalleryCategoryRepository categoryRepository,
            GallerySubcategoryRepository subcategoryRepository,
            CloudinaryService cloudinaryService
    ) {
        this.galleryItemRepository = galleryItemRepository;
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // ---------- Public ----------

    public List<GalleryItemDto> getPublishedByCategory(String categorySlug) {
        return galleryItemRepository
                .findByCategorySlugAndPublishedTrueOrderByCreatedAtDesc(categorySlug)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<GalleryItemDto> getPublishedByCategoryAndSubcategory(String categorySlug, String subcategorySlug) {
        return galleryItemRepository
                .findByCategorySlugAndSubcategorySlugAndPublishedTrueOrderByCreatedAtDesc(categorySlug, subcategorySlug)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<GalleryItemDto> getFeatured() {
        return galleryItemRepository.findFeatured()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ---------- Admin ----------

    public List<GalleryItemDto> adminGetAll(String categorySlugFilter) {
        List<GalleryItem> items = (categorySlugFilter == null || categorySlugFilter.isBlank())
                ? galleryItemRepository.findAll()
                : galleryItemRepository.findByCategorySlugOrderByCreatedAtDesc(categorySlugFilter);
        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public GalleryItemDto create(
            String categorySlug, String subcategorySlug, String title,
            String description, boolean published, MultipartFile image
    ) {
        GalleryCategory category = resolveCategory(categorySlug);
        GallerySubcategory subcategory = resolveSubcategory(category, subcategorySlug);

        CloudinaryService.UploadResult upload = cloudinaryService.upload(image);

        GalleryItem item = new GalleryItem();
        item.setCategory(category);
        item.setSubcategory(subcategory);
        item.setTitle(title);
        item.setDescription(description);
        item.setImageUrl(upload.url());
        item.setCloudinaryPublicId(upload.publicId());
        item.setPublished(published);

        return toDto(galleryItemRepository.save(item));
    }

    @Transactional
    public GalleryItemDto update(
            Long id, String categorySlug, String subcategorySlug, String title,
            String description, boolean published, MultipartFile newImage
    ) {
        GalleryItem item = galleryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found"));

        GalleryCategory category = resolveCategory(categorySlug);
        GallerySubcategory subcategory = resolveSubcategory(category, subcategorySlug);

        item.setCategory(category);
        item.setSubcategory(subcategory);
        item.setTitle(title);
        item.setDescription(description);
        item.setPublished(published);

        if (newImage != null && !newImage.isEmpty()) {
            String oldPublicId = item.getCloudinaryPublicId();
            CloudinaryService.UploadResult upload = cloudinaryService.upload(newImage);
            item.setImageUrl(upload.url());
            item.setCloudinaryPublicId(upload.publicId());
            cloudinaryService.delete(oldPublicId);
        }

        return toDto(galleryItemRepository.save(item));
    }

    /**
     * Deletes exactly one gallery item: its Cloudinary asset, then its DB row.
     * Never touches the category/subcategory structure or any other item.
     */
    @Transactional
    public void delete(Long id) {
        GalleryItem item = galleryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found"));
        cloudinaryService.delete(item.getCloudinaryPublicId());
        galleryItemRepository.delete(item);
    }

    // ---------- Helpers ----------

    private GalleryCategory resolveCategory(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown category: " + slug));
    }

    private GallerySubcategory resolveSubcategory(GalleryCategory category, String slug) {
        return subcategoryRepository.findByCategoryAndSlug(category, slug)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "Unknown subcategory '" + slug + "' for category '" + category.getSlug() + "'"));
    }

    private GalleryItemDto toDto(GalleryItem item) {
        return new GalleryItemDto(
                item.getId(),
                item.getCategory().getSlug(),
                item.getSubcategory().getSlug(),
                item.getSubcategory().getName(),
                item.getTitle(),
                item.getDescription(),
                item.getImageUrl(),
                item.isPublished(),
                item.getCreatedAt()
        );
    }

    public Map<String, Long> countsByCategory(List<String> categorySlugs) {
        return categorySlugs.stream()
                .collect(Collectors.toMap(slug -> slug, galleryItemRepository::countByCategorySlug));
    }
}
