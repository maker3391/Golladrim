package com.golladrim.food.service;

import com.golladrim.food.domain.FoodItem;
import com.golladrim.food.dto.FoodRecommendItem;
import com.golladrim.food.dto.FoodRecommendRequest;
import com.golladrim.food.dto.FoodRecommendResponse;
import com.golladrim.food.dto.RecommendStatus;
import com.golladrim.food.engine.FoodRuleEngine;
import com.golladrim.food.repository.FoodRepository;
import com.golladrim.food.resolver.FoodIntentResolver;
import com.golladrim.food.resolver.ResolvedFoodIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodIntentResolver intentResolver;
    private final FoodRepository foodRepository;
    private final FoodRuleEngine ruleEngine;

    @Transactional(readOnly = true)
    public FoodRecommendResponse recommend(FoodRecommendRequest request) {
        ResolvedFoodIntent intent = intentResolver.resolve(request.message());
        List<FoodItem> items = foodRepository.findAllByEnabledTrue();
        List<FoodRecommendItem> result = ruleEngine.recommend(items, intent, request.excludedFoodIds());
        RecommendStatus status = result.stream().anyMatch(item -> item.score() >= 1)
                ? RecommendStatus.SUCCESS
                : RecommendStatus.FALLBACK;
        return new FoodRecommendResponse(status, result);
    }
}
