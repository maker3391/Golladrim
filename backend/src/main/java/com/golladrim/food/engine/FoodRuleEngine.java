package com.golladrim.food.engine;

import com.golladrim.food.domain.FoodItem;
import com.golladrim.food.dto.FoodRecommendItem;
import com.golladrim.food.dto.RecommendStatus;
import com.golladrim.food.resolver.ResolvedFoodIntent;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class FoodRuleEngine {

    private static final Map<String, Integer> WEIGHTS = Map.ofEntries(
            Map.entry("situation", 5),
            Map.entry("taste", 5),
            Map.entry("mood", 4),
            Map.entry("healthStyle", 4),
            Map.entry("weather", 3),
            Map.entry("fullness", 3),
            Map.entry("ingredient", 2),
            Map.entry("format", 2),
            Map.entry("temperature", 2),
            Map.entry("nation", 2),
            Map.entry("season", 1)
    );

    public List<FoodRecommendItem> recommend(
            List<FoodItem> items,
            ResolvedFoodIntent intent,
            List<Long> excludedFoodIds
    ) {
        return recommendWithStatus(items, intent, excludedFoodIds).items();
    }

    public FoodRuleEngineResult recommendWithStatus(
            List<FoodItem> items,
            ResolvedFoodIntent intent,
            List<Long> excludedFoodIds
    ) {
        Set<Long> excludedIds = new HashSet<>(excludedFoodIds);
        Map<String, Set<String>> tagsByAxis = intent.getTagsByAxis();

        List<FoodRecommendItem> scored = items.stream()
                .filter(item -> !excludedIds.contains(item.getId()))
                .map(item -> score(item, tagsByAxis))
                .filter(result -> result.score() >= 1)
                .collect(Collectors.toCollection(ArrayList::new));

        if (!scored.isEmpty()) {
            return new FoodRuleEngineResult(RecommendStatus.SUCCESS, pickTop3(scored));
        }

        return new FoodRuleEngineResult(RecommendStatus.FALLBACK, randomFallback(items, excludedIds));
    }

    private List<FoodRecommendItem> pickTop3(List<FoodRecommendItem> scored) {
        scored.sort(Comparator.comparingInt(FoodRecommendItem::score).reversed());

        List<FoodRecommendItem> result = new ArrayList<>();
        int i = 0;
        while (i < scored.size() && result.size() < 3) {
            int currentScore = scored.get(i).score();
            int j = i;
            while (j < scored.size() && scored.get(j).score() == currentScore) j++;

            List<FoodRecommendItem> group = new ArrayList<>(scored.subList(i, j));
            Collections.shuffle(group);

            int remaining = 3 - result.size();
            result.addAll(group.subList(0, Math.min(group.size(), remaining)));
            i = j;
        }
        return result;
    }

    private List<FoodRecommendItem> randomFallback(List<FoodItem> items, Set<Long> excludedIds) {
        List<FoodItem> candidates = new ArrayList<>(
                items.stream().filter(item -> !excludedIds.contains(item.getId())).toList()
        );
        Collections.shuffle(candidates);
        return candidates.stream()
                .limit(3)
                .map(item -> {
                    String categoryName = item.getCategory() != null ? item.getCategory().getName() : "";
                    return new FoodRecommendItem(item.getId(), item.getName(), categoryName, item.getImageUrl(), 0, List.of(), "오늘의 추천 메뉴입니다.");
                })
                .toList();
    }

    private FoodRecommendItem score(FoodItem item, Map<String, Set<String>> tagsByAxis) {
        int total = 0;
        List<String> matchedTags = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : WEIGHTS.entrySet()) {
            String axis = entry.getKey();
            int weight = entry.getValue();
            Set<String> resolvedValues = tagsByAxis.get(axis);
            if (resolvedValues == null || resolvedValues.isEmpty()) continue;

            String[] itemTags = getAxisTags(item, axis);
            if (itemTags == null) continue;

            for (String resolvedValue : resolvedValues) {
                for (String itemTag : itemTags) {
                    if (resolvedValue.equalsIgnoreCase(itemTag)) {
                        total += weight;
                        matchedTags.add(resolvedValue);
                        break;
                    }
                }
            }
        }

        String categoryName = item.getCategory() != null ? item.getCategory().getName() : "";
        String reason = matchedTags.isEmpty()
                ? "추천 조건과 잘 맞는 메뉴입니다."
                : String.join(", ", matchedTags) + " 조건과 잘 맞는 메뉴입니다.";

        return new FoodRecommendItem(item.getId(), item.getName(), categoryName, item.getImageUrl(), total, matchedTags, reason);
    }

    private String[] getAxisTags(FoodItem item, String axis) {
        return switch (axis) {
            case "situation" -> item.getSituation();
            case "weather" -> item.getWeather();
            case "taste" -> item.getTaste();
            case "fullness" -> item.getFullness();
            case "mood" -> item.getMood();
            case "nation" -> item.getNation();
            case "ingredient" -> item.getIngredient();
            case "format" -> item.getFormat();
            case "temperature" -> item.getTemperature();
            case "healthStyle" -> item.getHealthStyle();
            case "season" -> item.getSeason();
            default -> null;
        };
    }
}
