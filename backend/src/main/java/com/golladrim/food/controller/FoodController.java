package com.golladrim.food.controller;

import com.golladrim.food.dto.FoodRecommendRequest;
import com.golladrim.food.dto.FoodRecommendResponse;
import com.golladrim.food.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping("/recommend")
    public ResponseEntity<FoodRecommendResponse> recommend(@Valid @RequestBody FoodRecommendRequest request) {
        return ResponseEntity.ok(foodService.recommend(request));
    }
}
