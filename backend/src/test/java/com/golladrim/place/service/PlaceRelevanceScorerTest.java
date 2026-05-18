package com.golladrim.place.service;

import com.golladrim.place.model.PlaceCandidate;
import com.golladrim.place.model.PlaceKeywordMatchType;
import com.golladrim.place.model.PlaceKeywordRule;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceRelevanceScorerTest {

    private final PlaceRelevanceScorer scorer = new PlaceRelevanceScorer();

    @Test
    void lotteriaIsExcludedForTonkatsuRecommendation() {
        PlaceCandidate lotteria = candidate(
                "롯데리아 부산서구점",
                "음식점 > 패스트푸드",
                "부산 서구",
                "부산 서구 구덕로",
                120
        );
        PlaceCandidate tonkatsu = candidate(
                "서구 돈까스",
                "음식점 > 일식 > 돈까스",
                "부산 서구",
                "부산 서구 구덕로",
                450
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "돈카츠",
                rules(
                        rule("돈카츠", 45, PlaceKeywordMatchType.NAME),
                        rule("돈까스", 45, PlaceKeywordMatchType.NAME),
                        rule("돈까스", 20, PlaceKeywordMatchType.CATEGORY),
                        rule("일식", 15, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(lotteria, tonkatsu)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("서구 돈까스");
    }

    @Test
    void fastFoodBrandsAreAllowedForBurgerRecommendation() {
        PlaceCandidate lotteria = candidate(
                "롯데리아 부산서구점",
                "음식점 > 패스트푸드",
                "부산 서구",
                "부산 서구 구덕로",
                120
        );
        PlaceCandidate momstouch = candidate(
                "맘스터치 대신점",
                "음식점 > 패스트푸드",
                "부산 서구",
                "부산 서구 대신로",
                300
        );
        PlaceCandidate cafe = candidate(
                "스타벅스 부산서구점",
                "음식점 > 카페",
                "부산 서구",
                "부산 서구 구덕로",
                80
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "햄버거",
                rules(
                        rule("햄버거", 45, PlaceKeywordMatchType.NAME),
                        rule("버거", 40, PlaceKeywordMatchType.NAME),
                        rule("패스트푸드", 20, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(cafe, momstouch, lotteria)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("롯데리아 부산서구점", "맘스터치 대신점");
    }

    @Test
    void genericKoreanRestaurantIsExcludedForPorkSoupRecommendation() {
        PlaceCandidate gukbap = candidate(
                "부산돼지국밥",
                "음식점 > 한식 > 국밥",
                "부산 서구",
                "부산 서구 구덕로",
                500
        );
        PlaceCandidate korean = candidate(
                "서구 한식당",
                "음식점 > 한식",
                "부산 서구",
                "부산 서구 구덕로",
                100
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "돼지국밥",
                rules(
                        rule("돼지국밥", 45, PlaceKeywordMatchType.NAME),
                        rule("국밥", 25, PlaceKeywordMatchType.CATEGORY),
                        rule("한식", 10, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(korean, gukbap)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("부산돼지국밥");
    }

    @Test
    void pastaRecommendationPrioritizesPastaAndItalianRestaurants() {
        PlaceCandidate italian = candidate(
                "서구 이탈리안 키친",
                "음식점 > 양식 > 이탈리안",
                "부산 서구",
                "부산 서구 구덕로",
                400
        );
        PlaceCandidate pasta = candidate(
                "오늘의 파스타",
                "음식점 > 양식",
                "부산 서구",
                "부산 서구 구덕로",
                800
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "파스타",
                rules(
                        rule("파스타", 45, PlaceKeywordMatchType.NAME),
                        rule("파스타", 30, PlaceKeywordMatchType.CATEGORY),
                        rule("이탈리안", 20, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(italian, pasta)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("오늘의 파스타", "서구 이탈리안 키친");
    }

    @Test
    void relevanceScoreIsMoreImportantThanDistance() {
        PlaceCandidate closeButWeak = candidate(
                "가까운 찌개전골",
                "음식점 > 한식 > 찌개전골",
                "부산 서구",
                "부산 서구 구덕로",
                100
        );
        PlaceCandidate farButStrong = candidate(
                "장모 김치찌개",
                "음식점 > 한식 > 찌개",
                "부산 서구",
                "부산 서구 구덕로",
                900
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "김치찌개",
                rules(
                        rule("김치찌개", 45, PlaceKeywordMatchType.NAME),
                        rule("찌개", 20, PlaceKeywordMatchType.CATEGORY),
                        rule("한식", 10, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(closeButWeak, farButStrong)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("장모 김치찌개", "가까운 찌개전골");
    }

    @Test
    void fallbackSortKeepsMeatCategoryCandidatesByDistance() {
        PlaceCandidate farMeat = candidate(
                "서구 고깃집",
                "음식점 > 한식 > 육류,고기요리",
                "부산 서구",
                "부산 서구 구덕로",
                700
        );
        PlaceCandidate closeButcher = candidate(
                "동네 정육식당",
                "음식점 > 한식 > 정육식당",
                "부산 서구",
                "부산 서구 대신로",
                200
        );
        PlaceCandidate excludedFastFood = candidate(
                "롯데리아 부산서구점",
                "음식점 > 패스트푸드",
                "부산 서구",
                "부산 서구 구덕로",
                100
        );

        List<PlaceCandidate> result = scorer.fallbackSort(List.of(farMeat, closeButcher, excludedFastFood));

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("동네 정육식당", "서구 고깃집");
    }

    @Test
    void unscoredCandidatesAreNotIncludedWhenScoredCandidatesExist() {
        PlaceCandidate unscoredClose = candidate(
                "가까운 고깃집",
                "음식점 > 한식 > 육류,고기요리",
                "부산 서구",
                "부산 서구 대신로",
                100
        );
        PlaceCandidate scoredFar = candidate(
                "서구 돈까스",
                "음식점 > 일식 > 돈까스",
                "부산 서구",
                "부산 서구 구덕로",
                900
        );

        List<PlaceCandidate> result = scorer.filterAndSort(
                "돈카츠",
                rules(
                        rule("돈카츠", 45, PlaceKeywordMatchType.NAME),
                        rule("돈까스", 45, PlaceKeywordMatchType.NAME),
                        rule("돈까스", 20, PlaceKeywordMatchType.CATEGORY)
                ),
                List.of(unscoredClose, scoredFar)
        );

        assertThat(result).extracting(PlaceCandidate::placeName)
                .containsExactly("서구 돈까스");
    }

    private List<PlaceKeywordRule> rules(PlaceKeywordRule... rules) {
        return List.of(rules);
    }

    private PlaceKeywordRule rule(String keyword, int weight, PlaceKeywordMatchType matchType) {
        return new PlaceKeywordRule(keyword, weight, matchType);
    }

    private PlaceCandidate candidate(
            String placeName,
            String categoryName,
            String addressName,
            String roadAddressName,
            Integer distance
    ) {
        return new PlaceCandidate(
                placeName,
                categoryName,
                addressName,
                roadAddressName,
                "",
                "https://place.map.kakao.com/test",
                35.0,
                129.0,
                distance
        );
    }
}
