package com.golladrim.food.repository;

import com.golladrim.food.domain.FoodItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRepository extends JpaRepository<FoodItem, Long> {
    @EntityGraph(attributePaths = "category")
    List<FoodItem> findAllByEnabledTrue();
}
