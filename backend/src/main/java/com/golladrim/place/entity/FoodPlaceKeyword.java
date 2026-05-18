package com.golladrim.place.entity;

import com.golladrim.food.domain.FoodItem;
import com.golladrim.place.model.PlaceKeywordMatchType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_place_keywords")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FoodPlaceKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false, length = 100)
    private String keyword;

    @Column(nullable = false)
    private int weight;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", nullable = false, length = 30)
    private PlaceKeywordMatchType matchType;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
