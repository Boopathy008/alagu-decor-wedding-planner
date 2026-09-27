package com.alagu.decor.repository;

import com.alagu.decor.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {

    List<GalleryItem> findByCategorySlugAndPublishedTrueOrderByCreatedAtDesc(String categorySlug);

    List<GalleryItem> findByCategorySlugAndSubcategorySlugAndPublishedTrueOrderByCreatedAtDesc(
            String categorySlug, String subcategorySlug);

    @Query("select g from GalleryItem g where g.published = true order by g.createdAt desc")
    List<GalleryItem> findFeatured();

    List<GalleryItem> findByCategorySlugOrderByCreatedAtDesc(String categorySlug);

    long countByCategorySlug(String categorySlug);
}
