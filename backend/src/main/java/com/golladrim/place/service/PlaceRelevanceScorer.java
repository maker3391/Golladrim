package com.golladrim.place.service;

import com.golladrim.place.model.PlaceCandidate;
import com.golladrim.place.model.ScoredPlaceCandidate;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class PlaceRelevanceScorer {

    private static final Map<String, List<String>> FOOD_SYNONYMS = Map.ofEntries(
            Map.entry("돈카츠", List.of("돈카츠", "돈까스", "돈가스", "일식", "카츠")),
            Map.entry("김치찌개", List.of("김치찌개", "찌개", "한식")),
            Map.entry("돼지국밥", List.of("돼지국밥", "국밥", "한식")),
            Map.entry("파스타", List.of("파스타", "양식", "이탈리안")),
            Map.entry("삼겹살", List.of("삼겹살", "고기", "육류", "고기요리", "정육식당", "구이", "한식")),
            Map.entry("햄버거", List.of("햄버거", "버거", "패스트푸드", "수제버거")),
            Map.entry("치킨", List.of("치킨", "닭강정", "닭요리", "후라이드", "양념치킨")),
            Map.entry("피자", List.of("피자", "양식", "이탈리안")),
            Map.entry("떡볶이", List.of("떡볶이", "분식")),
            Map.entry("라멘", List.of("라멘", "라면", "일식")),
            Map.entry("초밥", List.of("초밥", "스시", "일식")),
            Map.entry("냉면", List.of("냉면", "한식")),
            Map.entry("짜장면", List.of("짜장면", "자장면", "중식", "중국집")),
            Map.entry("짬뽕", List.of("짬뽕", "중식", "중국집")),
            Map.entry("마라탕", List.of("마라탕", "마라", "중식")),
            Map.entry("쌀국수", List.of("쌀국수", "베트남", "아시아음식")),
            Map.entry("샤브샤브", List.of("샤브샤브", "월남쌈", "한식")),
            Map.entry("회", List.of("회", "횟집", "해산물", "일식")),
            Map.entry("곱창", List.of("곱창", "막창", "대창", "구이", "한식")),
            Map.entry("족발", List.of("족발", "보쌈", "한식"))
    );

    private static final List<String> ALWAYS_EXCLUDED = List.of(
            "스타벅스", "이디야", "투썸", "투썸플레이스", "메가커피", "컴포즈커피",
            "빽다방", "할리스", "커피빈", "엔제리너스", "파스쿠찌",
            "cu", "gs25", "세븐일레븐", "7-eleven", "이마트24", "미니스톱",
            "파리바게뜨", "뚜레쥬르"
    );

    private static final List<String> FAST_FOOD_BRANDS = List.of(
            "롯데리아", "맥도날드", "버거킹", "kfc", "맘스터치",
            "노브랜드버거", "프랭크버거", "쉐이크쉑", "파이브가이즈"
    );

    private static final List<String> BURGER_FOODS = List.of(
            "햄버거", "버거", "수제버거", "치킨버거", "패스트푸드"
    );

    private static final List<String> EXCLUDED_CATEGORIES = List.of(
            "패스트푸드", "카페", "편의점", "마트"
    );

    public List<PlaceCandidate> filterAndSort(String foodName, List<PlaceCandidate> candidates) {
        List<String> keywords = keywordsFor(foodName);

        List<PlaceCandidate> filteredCandidates = candidates.stream()
                .filter(this::isRestaurant)
                .filter(candidate -> !isClearlyIrrelevant(candidate, foodName))
                .toList();

        List<PlaceCandidate> scoredCandidates = filteredCandidates.stream()
                .map(candidate -> score(candidate, keywords))
                .flatMap(Optional::stream)
                .sorted(Comparator
                        .comparingInt(ScoredPlaceCandidate::score).reversed()
                        .thenComparingInt(scored -> distanceOrMax(scored.candidate())))
                .map(ScoredPlaceCandidate::candidate)
                .toList();

        if (!scoredCandidates.isEmpty()) {
            return scoredCandidates;
        }

        return filteredCandidates.stream()
                .sorted(Comparator.comparingInt(this::distanceOrMax))
                .toList();
    }

    private List<String> keywordsFor(String foodName) {
        String normalizedFoodName = normalize(foodName);

        return FOOD_SYNONYMS.entrySet().stream()
                .filter(entry -> normalizedFoodName.contains(normalize(entry.getKey())))
                .findFirst()
                .map(Map.Entry::getValue)
                .orElseGet(() -> List.of(foodName));
    }

    private Optional<ScoredPlaceCandidate> score(PlaceCandidate candidate, List<String> keywords) {
        int score = 0;

        for (int index = 0; index < keywords.size(); index += 1) {
            String keyword = keywords.get(index);
            boolean primaryKeyword = index == 0;

            if (contains(candidate.placeName(), keyword)) score += primaryKeyword ? 10 : 5;
            if (contains(candidate.categoryName(), keyword)) score += primaryKeyword ? 5 : 3;
            if (contains(candidate.roadAddressName(), keyword)) score += 1;
            if (contains(candidate.addressName(), keyword)) score += 1;
        }

        if (score <= 0) {
            return Optional.empty();
        }

        return Optional.of(new ScoredPlaceCandidate(candidate, score));
    }

    private boolean isRestaurant(PlaceCandidate candidate) {
        return contains(candidate.categoryName(), "음식점");
    }

    private boolean isClearlyIrrelevant(PlaceCandidate candidate, String foodName) {
        String searchableText = normalize(String.join(" ",
                nullToEmpty(candidate.placeName()),
                nullToEmpty(candidate.categoryName())
        ));
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

    private boolean isBurgerFood(String foodName) {
        String normalizedFoodName = normalize(foodName);
        return BURGER_FOODS.stream()
                .anyMatch(food -> normalizedFoodName.contains(normalize(food)));
    }

    private boolean contains(String text, String keyword) {
        return normalize(text).contains(normalize(keyword));
    }

    private String normalize(String value) {
        return nullToEmpty(value)
                .toLowerCase(Locale.ROOT)
                .replace(" ", "");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private int distanceOrMax(PlaceCandidate candidate) {
        return candidate.distance() == null ? Integer.MAX_VALUE : candidate.distance();
    }
}
