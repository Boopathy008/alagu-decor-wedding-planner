package com.alagu.decor.repository;

import com.alagu.decor.entity.GalleryCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GalleryCategoryRepository extends JpaRepository<GalleryCategory, Long> {
    Optional<GalleryCategory> findBySlug(String slug);
}
