package com.golladrim.place.service;

import com.golladrim.place.adapter.KakaoPlaceAdapter;
import com.golladrim.place.client.KakaoPlaceClient;
import com.golladrim.place.dto.GeocodeResponse;
import com.golladrim.place.dto.PlaceRecommendRequest;
import com.golladrim.place.dto.PlaceRecommendResponse;
import com.golladrim.place.dto.PlaceResponse;
import com.golladrim.place.port.PlaceSearchPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaceRecommendationService {

    private static final int MAX_PLACE_COUNT = 5;

    private final PlaceSearchPort placeSearchPort;
    private final KakaoPlaceClient kakaoPlaceClient;
    private final KakaoPlaceAdapter kakaoPlaceAdapter;
    private final PlaceRelevanceScorer placeRelevanceScorer;

    public PlaceRecommendResponse recommend(PlaceRecommendRequest request) {
        String query = request.foodName().trim() + " 맛집";

        log.info("Place recommend request: foodId={}, foodName={}, latitude={}, longitude={}",
                request.foodId(), request.foodName(), request.latitude(), request.longitude());

        List<PlaceResponse> places = placeRelevanceScorer
                .filterAndSort(request.foodName(), placeSearchPort.search(query, request.latitude(), request.longitude()))
                .stream()
                .limit(MAX_PLACE_COUNT)
                .map(kakaoPlaceAdapter::toPlaceResponse)
                .toList();

        String message = places.isEmpty()
                ? "근처 맛집을 찾지 못했어요. 위치를 조금 바꿔 다시 시도해 주세요."
                : null;

        return new PlaceRecommendResponse(
                request.foodId(),
                request.foodName(),
                places,
                message
        );
    }

    public GeocodeResponse reverseGeocode(double latitude, double longitude) {
        return new GeocodeResponse(kakaoPlaceClient.reverseGeocode(latitude, longitude));
    }
}
