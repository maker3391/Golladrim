package com.golladrim.place.repository;

import com.golladrim.place.entity.FoodPlaceKeyword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodPlaceKeywordRepository extends JpaRepository<FoodPlaceKeyword, Long> {
    List<FoodPlaceKeyword> findAllByFoodItem_Id(Long foodItemId);
}
