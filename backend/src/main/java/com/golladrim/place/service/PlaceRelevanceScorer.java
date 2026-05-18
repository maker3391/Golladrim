package com.golladrim.place.service;

import com.golladrim.place.model.PlaceCandidate;
import com.golladrim.place.model.PlaceKeywordMatchType;
import com.golladrim.place.model.PlaceKeywordRule;
import com.golladrim.place.model.ScoredPlaceCandidate;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Component
public class PlaceRelevanceScorer {

    private static final int DISTANCE_BUCKET_METERS = 500;

    private static final List<String> ALWAYS_EXCLUDED = List.of(
            "스타벅스", "이디야", "투썸", "투썸플레이스", "메가커피", "컴포즈커피",
            "빽다방", "할리스", "커피빈", "엔제리너스", "파스쿠찌",
            "cu", "gs25", "세븐일레븐", "7-eleven", "이마트24", "미니스톱",
            "파리바게뜨", "뚜레쥬르", "편의점", "마트", "슈퍼"
    );

    private static final List<String> FAST_FOOD_BRANDS = List.of(
            "롯데리아", "맥도날드", "버거킹", "kfc", "맘스터치",
            "노브랜드버거", "프랭크버거", "쉐이크쉑", "파이브가이즈"
    );

    private static final List<String> BURGER_FOODS = List.of(
            "햄버거", "버거", "수제버거", "치킨버거", "패스트푸드"
    );

    private static final List<String> EXCLUDED_CATEGORIES = List.of(
            "패스트푸드", "카페", "편의점", "마트", "술집", "주점"
    );

    public List<PlaceCandidate> filterAndSort(
            String foodName,
            List<PlaceKeywordRule> rules,
            List<PlaceCandidate> candidates
    ) {
        return candidates.stream()
                .filter(this::isRestaurant)
                .filter(candidate -> !isClearlyIrrelevant(candidate, foodName))
                .map(candidate -> score(candidate, rules))
                .flatMap(Optional::stream)
                .collect(
                        LinkedHashMap<String, ScoredPlaceCandidate>::new,
                        this::putHigherScoreCandidate,
                        this::mergeScoredCandidates
                )
                .values()
                .stream()
                .sorted(Comparator
                        .comparingInt(ScoredPlaceCandidate::score).reversed()
                        .thenComparingInt(scored -> distanceBucket(scored.candidate()))
                        .thenComparingInt(scored -> distanceOrMax(scored.candidate())))
                .map(ScoredPlaceCandidate::candidate)
                .toList();
    }

    public List<PlaceCandidate> fallbackSort(List<PlaceCandidate> candidates) {
        Set<String> seen = new LinkedHashSet<>();

        return candidates.stream()
                .filter(this::isRestaurant)
                .filter(candidate -> !isClearlyFallbackExcluded(candidate))
                .filter(candidate -> seen.add(uniqueKey(candidate)))
                .sorted(Comparator.comparingInt(this::distanceOrMax))
                .toList();
    }

    private Optional<ScoredPlaceCandidate> score(PlaceCandidate candidate, List<PlaceKeywordRule> rules) {
        int score = 0;

        for (PlaceKeywordRule rule : rules) {
            if (rule.matchType() == PlaceKeywordMatchType.NAME && contains(candidate.placeName(), rule.keyword())) {
                score += rule.weight();
            }

            if (rule.matchType() == PlaceKeywordMatchType.CATEGORY && contains(candidate.categoryName(), rule.keyword())) {
                score += rule.weight();
            }

            if (rule.matchType() == PlaceKeywordMatchType.ADDRESS &&
                    (contains(candidate.addressName(), rule.keyword()) || contains(candidate.roadAddressName(), rule.keyword()))) {
                score += rule.weight();
            }
        }

        if (hasPhone(candidate)) {
            score += 3;
        }

        boolean hasNameMatch = rules.stream()
                .filter(r -> r.matchType() == PlaceKeywordMatchType.NAME)
                .anyMatch(r -> contains(candidate.placeName(), r.keyword()));

        if (!hasNameMatch && score < 20) {
            return Optional.empty();
        }

        if (score <= 0) {
            return Optional.empty();
        }

        return Optional.of(new ScoredPlaceCandidate(candidate, score));
    }

    private void putHigherScoreCandidate(
            LinkedHashMap<String, ScoredPlaceCandidate> candidates,
            ScoredPlaceCandidate scoredCandidate
    ) {
        candidates.merge(
                uniqueKey(scoredCandidate.candidate()),
                scoredCandidate,
                this::higherScoreCandidate
        );
    }

    private void mergeScoredCandidates(
            LinkedHashMap<String, ScoredPlaceCandidate> left,
            LinkedHashMap<String, ScoredPlaceCandidate> right
    ) {
        right.forEach((key, candidate) -> left.merge(key, candidate, this::higherScoreCandidate));
    }

    private ScoredPlaceCandidate higherScoreCandidate(
            ScoredPlaceCandidate current,
            ScoredPlaceCandidate candidate
    ) {
        if (candidate.score() > current.score()) {
            return candidate;
        }

        if (candidate.score() == current.score()
                && distanceOrMax(candidate.candidate()) < distanceOrMax(current.candidate())) {
            return candidate;
        }

        return current;
    }

    private boolean isRestaurant(PlaceCandidate candidate) {
        return contains(candidate.categoryName(), "음식점");
    }

    private boolean isClearlyIrrelevant(PlaceCandidate candidate, String foodName) {
        String searchableText = searchableText(candidate);
        boolean burgerFood = isBurgerFood(foodName);

        if (ALWAYS_EXCLUDED.stream().anyMatch(keyword -> searchableText.contains(normalize(keyword)))) {
            return true;
        }

        if (!burgerFood && FAST_FOOD_BRANDS.stream().anyMatch(keyword -> searchableText.contains(normalize(keyword)))) {
            return true;
        }

        return EXCLUDED_CATEGORIES.stream()
                .filter(category -> !burgerFood || !normalize(category).equals(normalize("패스트푸드")))
                .anyMatch(category -> searchableText.contains(normalize(category)));
    }

    private boolean isClearlyFallbackExcluded(PlaceCandidate candidate) {
        String searchableText = searchableText(candidate);

        if (ALWAYS_EXCLUDED.stream().anyMatch(keyword -> searchableText.contains(normalize(keyword)))) {
            return true;
        }

        if (FAST_FOOD_BRANDS.stream().anyMatch(keyword -> searchableText.contains(normalize(keyword)))) {
            return true;
        }

        return EXCLUDED_CATEGORIES.stream()
                .anyMatch(category -> searchableText.contains(normalize(category)));
    }

    private boolean isBurgerFood(String foodName) {
        String normalizedFoodName = normalize(foodName);
        return BURGER_FOODS.stream()
                .anyMatch(food -> normalizedFoodName.contains(normalize(food)));
    }

    private boolean contains(String text, String keyword) {
        return normalize(text).contains(normalize(keyword));
    }

    private boolean hasPhone(PlaceCandidate candidate) {
        return candidate.phone() != null && !candidate.phone().isBlank();
    }

    private String searchableText(PlaceCandidate candidate) {
        return normalize(String.join(" ",
                nullToEmpty(candidate.placeName()),
                nullToEmpty(candidate.categoryName())
        ));
    }

    private String uniqueKey(PlaceCandidate candidate) {
        return normalize(nullToEmpty(candidate.placeName()) + "|" + nullToEmpty(candidate.addressName()));
    }

    private String normalize(String value) {
        return nullToEmpty(value)
                .toLowerCase(Locale.ROOT)
                .replace(" ", "");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private int distanceBucket(PlaceCandidate candidate) {
        int distance = distanceOrMax(candidate);
        if (distance == Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }

        return distance / DISTANCE_BUCKET_METERS;
    }

    private int distanceOrMax(PlaceCandidate candidate) {
        return candidate.distance() == null ? Integer.MAX_VALUE : candidate.distance();
    }
}
