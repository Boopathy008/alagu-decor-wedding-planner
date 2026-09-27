package com.alagu.decor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Mirrors the FIXED categories defined in the frontend's services.ts.
 * There is intentionally no admin endpoint to create/update/delete these —
 * they are seeded once via database/schema.sql and never change at runtime.
 */
@Entity
@Table(name = "gallery_categories")
@Getter
@Setter
@NoArgsConstructor
public class GalleryCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;
}
