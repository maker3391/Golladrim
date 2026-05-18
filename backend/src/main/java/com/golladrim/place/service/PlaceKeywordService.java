package com.golladrim.place.service;

import com.golladrim.place.model.PlaceKeywordMatchType;
import com.golladrim.place.model.PlaceKeywordRule;
import com.golladrim.place.repository.FoodPlaceKeywordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PlaceKeywordService {

    private static final int MAX_QUERY_COUNT = 5;
    private static final Set<String> GENERIC_SINGLE_QUERIES = Set.of(
            "한식", "양식", "일식", "중식", "음식점", "맛집", "카페", "디저트", "분식"
    );

    private final FoodPlaceKeywordRepository foodPlaceKeywordRepository;

    public List<PlaceKeywordRule> getRules(Long foodId, String foodName) {
        List<PlaceKeywordRule> rules = foodPlaceKeywordRepository.findAllByFoodItem_Id(foodId)
                .stream()
                .map(keyword -> new PlaceKeywordRule(
                        keyword.getKeyword(),
                        keyword.getWeight(),
                        keyword.getMatchType()
                ))
                .toList();

        if (!rules.isEmpty()) {
            return rules;
        }

        return List.of(new PlaceKeywordRule(foodName, 45, PlaceKeywordMatchType.NAME));
    }

    public List<String> searchQueries(Long foodId, String foodName) {
        List<PlaceKeywordRule> rules = getRules(foodId, foodName).stream()
                .filter(rule -> rule.keyword() != null && !rule.keyword().isBlank())
                .sorted(Comparator.comparingInt(PlaceKeywordRule::weight).reversed())
                .toList();
        LinkedHashSet<String> queries = new LinkedHashSet<>();

        String primaryName = rules.stream()
                .filter(rule -> rule.matchType() == PlaceKeywordMatchType.NAME)
                .map(PlaceKeywordRule::keyword)
                .findFirst()
                .orElse(foodName);

        addQuery(queries, primaryName + " 맛집");

        rules.stream()
                .filter(rule -> rule.matchType() == PlaceKeywordMatchType.NAME)
                .map(PlaceKeywordRule::keyword)
                .forEach(query -> addQuery(queries, query));

        rules.stream()
                .filter(rule -> rule.matchType() == PlaceKeywordMatchType.CATEGORY)
                .map(PlaceKeywordRule::keyword)
                .filter(keyword -> !isGenericSingleQuery(keyword))
                .forEach(query -> addQuery(queries, query));

        rules.stream()
                .filter(rule -> rule.matchType() == PlaceKeywordMatchType.CATEGORY)
                .map(PlaceKeywordRule::keyword)
                .filter(this::isGenericSingleQuery)
                .forEach(category -> addQuery(queries, category + " " + primaryName));

        return queries.stream()
                .limit(MAX_QUERY_COUNT)
                .toList();
    }

    private void addQuery(LinkedHashSet<String> queries, String query) {
        String trimmedQuery = query == null ? "" : query.trim().replaceAll("\\s+", " ");
        if (trimmedQuery.isBlank() || isGenericSingleQuery(trimmedQuery)) {
            return;
        }

        queries.add(trimmedQuery);
    }

    private boolean isGenericSingleQuery(String query) {
        String normalizedQuery = query == null ? "" : query.trim().replace(" ", "");
        return GENERIC_SINGLE_QUERIES.stream()
                .map(keyword -> keyword.replace(" ", ""))
                .anyMatch(keyword -> keyword.equals(normalizedQuery));
    }
}
