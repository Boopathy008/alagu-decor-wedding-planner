package com.alagu.decor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gallery_subcategories", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"category_id", "slug"})
})
@Getter
@Setter
@NoArgsConstructor
public class GallerySubcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private GalleryCategory category;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String name;
}
