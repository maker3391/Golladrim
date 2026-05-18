package com.golladrim.place.service;

import com.golladrim.place.adapter.KakaoPlaceAdapter;
import com.golladrim.place.client.KakaoPlaceClient;
import com.golladrim.place.dto.GeocodeResponse;
import com.golladrim.place.dto.PlaceRecommendRequest;
import com.golladrim.place.dto.PlaceRecommendResponse;
import com.golladrim.place.dto.PlaceResponse;
import com.golladrim.place.model.PlaceCandidate;
import com.golladrim.place.model.PlaceKeywordRule;
import com.golladrim.place.port.PlaceSearchPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PlaceRecommendationService {

    private static final int MAX_PLACE_COUNT = 5;

    private final PlaceSearchPort placeSearchPort;
    private final KakaoPlaceClient kakaoPlaceClient;
    private final KakaoPlaceAdapter kakaoPlaceAdapter;
    private final PlaceRelevanceScorer placeRelevanceScorer;
    private final PlaceKeywordService placeKeywordService;
    private final int defaultRadius;

    public PlaceRecommendationService(
            PlaceSearchPort placeSearchPort,
            KakaoPlaceClient kakaoPlaceClient,
            KakaoPlaceAdapter kakaoPlaceAdapter,
            PlaceRelevanceScorer placeRelevanceScorer,
            PlaceKeywordService placeKeywordService,
            @Value("${app.kakao.local.radius:3000}") int defaultRadius
    ) {
        this.placeSearchPort = placeSearchPort;
        this.kakaoPlaceClient = kakaoPlaceClient;
        this.kakaoPlaceAdapter = kakaoPlaceAdapter;
        this.placeRelevanceScorer = placeRelevanceScorer;
        this.placeKeywordService = placeKeywordService;
        this.defaultRadius = defaultRadius;
    }

    public PlaceRecommendResponse recommend(PlaceRecommendRequest request) {
        String foodName = request.foodName().trim();
        int radius = request.radius() == null || request.radius() <= 0 ? defaultRadius : request.radius();

        log.info("Place recommend request: foodId={}, foodName={}, latitude={}, longitude={}, radius={}",
                request.foodId(), foodName, request.latitude(), request.longitude(), radius);

        List<PlaceKeywordRule> rules = placeKeywordService.getRules(request.foodId(), foodName);
        List<String> queries = placeKeywordService.searchQueries(request.foodId(), foodName);
        log.info("Place search queries: foodId={}, queries={}", request.foodId(), queries);

        List<PlaceCandidate> primaryCandidates = queries.stream()
                .flatMap(query -> placeSearchPort
                        .search(query, request.latitude(), request.longitude(), radius)
                        .stream())
                .filter(candidate -> isWithinRadius(candidate.distance(), radius))
                .toList();

        List<PlaceCandidate> rankedCandidates = placeRelevanceScorer.filterAndSort(foodName, rules, primaryCandidates);

        if (rankedCandidates.isEmpty()) {
            List<PlaceCandidate> fallbackCandidates = placeSearchPort
                    .search("맛집", request.latitude(), request.longitude(), radius)
                    .stream()
                    .filter(candidate -> isWithinRadius(candidate.distance(), radius))
                    .toList();

            rankedCandidates = placeRelevanceScorer.filterAndSort(foodName, rules, fallbackCandidates);
        }

        List<PlaceResponse> places = rankedCandidates.stream()
                .limit(MAX_PLACE_COUNT)
                .map(kakaoPlaceAdapter::toPlaceResponse)
                .toList();

        String message = places.isEmpty()
                ? "근처 맛집을 찾지 못했어요. 위치를 조금 바꿔 다시 시도해 주세요."
                : null;

        return new PlaceRecommendResponse(
                request.foodId(),
                foodName,
                places,
                message
        );
    }

    public GeocodeResponse reverseGeocode(double latitude, double longitude) {
        return new GeocodeResponse(kakaoPlaceClient.reverseGeocode(latitude, longitude));
    }

    private boolean isWithinRadius(Integer distance, int radius) {
        return distance != null && distance <= radius;
    }
}
