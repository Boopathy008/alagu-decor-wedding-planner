package com.alagu.decor.repository;

import com.alagu.decor.entity.GalleryCategory;
import com.alagu.decor.entity.GallerySubcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GallerySubcategoryRepository extends JpaRepository<GallerySubcategory, Long> {
    Optional<GallerySubcategory> findByCategoryAndSlug(GalleryCategory category, String slug);
}
