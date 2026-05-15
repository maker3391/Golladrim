package com.golladrim.food.domain;

import com.golladrim.common.domain.BaseEntity;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "food_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FoodItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private FoodCategory category;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] situation;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] weather;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] taste;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] fullness;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] mood;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] nation;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] ingredient;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] format;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] temperature;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] healthStyle;

    @Column(columnDefinition = "text[]")
    @Type(value = StringArrayType.class)
    private String[] season;

    @Column(nullable = false)
    private boolean enabled = true;
}
