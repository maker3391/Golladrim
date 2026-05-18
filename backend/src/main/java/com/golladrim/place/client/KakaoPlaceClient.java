package com.golladrim.place.client;

import com.golladrim.place.adapter.KakaoPlaceAdapter;
import com.golladrim.place.model.PlaceCandidate;
import com.golladrim.place.port.PlaceSearchPort;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class KakaoPlaceClient implements PlaceSearchPort {

    private final RestClient restClient;
    private final KakaoPlaceAdapter kakaoPlaceAdapter;
    private final String apiKey;
    private final int radius;

    public KakaoPlaceClient(
            RestClient.Builder restClientBuilder,
            KakaoPlaceAdapter kakaoPlaceAdapter,
            @Value("${app.kakao.local.base-url}") String baseUrl,
            @Value("${app.kakao.local.api-key:}") String apiKey,
            @Value("${app.kakao.local.radius:3000}") int radius
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setReadTimeout(3000);
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        this.kakaoPlaceAdapter = kakaoPlaceAdapter;
        this.apiKey = apiKey;
        this.radius = radius;
    }

    @Override
    @CircuitBreaker(name = "kakaoPlace", fallbackMethod = "fallbackSearch")
    public List<PlaceCandidate> search(String query, double latitude, double longitude) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Kakao Local API key is not configured.");
            return List.of();
        }

        log.info("Kakao place search params: query={}, x(longitude)={}, y(latitude)={}, radius={}, sort=distance",
                query, longitude, latitude, radius);

        KakaoPlaceSearchResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .queryParam("radius", radius)
                        .queryParam("sort", "distance")
                        .build())
                .header("Authorization", "KakaoAK " + apiKey)
                .retrieve()
                .body(KakaoPlaceSearchResponse.class);

        if (response == null || response.documents() == null) {
            return List.of();
        }

        return response.documents().stream()
                .map(kakaoPlaceAdapter::toPlaceCandidate)
                .toList();
    }

    @SuppressWarnings("unused")
    private List<PlaceCandidate> fallbackSearch(
            String query,
            double latitude,
            double longitude,
            Throwable throwable
    ) {
        log.warn("Kakao place search fallback. query={}, latitude={}, longitude={}",
                query, latitude, longitude, throwable);
        return List.of();
    }

    @CircuitBreaker(name = "kakaoGeocode", fallbackMethod = "fallbackGeocode")
    public String reverseGeocode(double latitude, double longitude) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Kakao Local API key is not configured.");
            return "";
        }

        log.info("Kakao reverse geocode params: x(longitude)={}, y(latitude)={}", longitude, latitude);

        KakaoGeocodeResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/geo/coord2address.json")
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .build())
                .header("Authorization", "KakaoAK " + apiKey)
                .retrieve()
                .body(KakaoGeocodeResponse.class);

        if (response == null || response.documents() == null || response.documents().isEmpty()) {
            return "";
        }

        KakaoGeocodeResponse.Document document = response.documents().getFirst();
        if (document.address() != null) {
            String region1 = nullToEmpty(document.address().region1DepthName());
            String region2 = nullToEmpty(document.address().region2DepthName());
            String region3 = nullToEmpty(document.address().region3DepthName());
            String address = (region1 + " " + region2 + " " + region3).trim();
            if (!address.isBlank()) {
                return address;
            }
        }

        if (document.roadAddress() != null) {
            return nullToEmpty(document.roadAddress().region2DepthName()).trim();
        }

        return "";
    }

    @SuppressWarnings("unused")
    private String fallbackGeocode(double latitude, double longitude, Throwable throwable) {
        log.warn("Kakao reverse geocode fallback. latitude={}, longitude={}",
                latitude, longitude, throwable);
        return "";
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
