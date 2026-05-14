package com.golladrim.food.resolver;

import com.golladrim.food.domain.IntentKeyword;
import com.golladrim.food.repository.IntentKeywordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FoodIntentResolver {

    private final IntentKeywordRepository intentKeywordRepository;

    public ResolvedFoodIntent resolve(String message) {
        String normalized = message == null ? "" : message.trim().toLowerCase();
        List<IntentKeyword> keywords = intentKeywordRepository.findAllByEnabledTrue();

        ResolvedFoodIntent intent = new ResolvedFoodIntent();

        for (IntentKeyword keyword : keywords) {
            if (keyword.getKeywords() == null) continue;
            boolean matched = Arrays.stream(keyword.getKeywords())
                    .anyMatch(k -> normalized.contains(k.trim().toLowerCase()));
            if (matched) {
                intent.add(keyword.getTagAxis(), keyword.getTagValue());
            }
        }

        return intent;
    }
}
