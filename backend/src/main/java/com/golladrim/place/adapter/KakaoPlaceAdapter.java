package com.golladrim.place.adapter;

import com.golladrim.place.client.KakaoPlaceSearchResponse;
import com.golladrim.place.dto.PlaceResponse;
import com.golladrim.place.model.PlaceCandidate;
import org.springframework.stereotype.Component;

@Component
public class KakaoPlaceAdapter {

    public PlaceCandidate toPlaceCandidate(KakaoPlaceSearchResponse.Document document) {
        return new PlaceCandidate(
                document.placeName(),
                document.categoryName(),
                document.addressName(),
                document.roadAddressName(),
                document.phone(),
                document.placeUrl(),
                parseDouble(document.y()),
                parseDouble(document.x()),
                parseInteger(document.distance())
        );
    }

    public PlaceResponse toPlaceResponse(PlaceCandidate candidate) {
        return new PlaceResponse(
                candidate.placeName(),
                resolveDisplayCategory(candidate.categoryName()),
                candidate.addressName(),
                candidate.roadAddressName(),
                candidate.phone(),
                candidate.placeUrl(),
                candidate.latitude(),
                candidate.longitude(),
                candidate.distance()
        );
    }

    private String resolveDisplayCategory(String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            return "음식점";
        }

        String[] parts = categoryName.split(">");
        for (int i = parts.length - 1; i >= 0; i--) {
            String part = parts[i].trim();
            if (!part.isBlank() && !isGenericCategory(part)) {
                return part;
            }
        }

        return "음식점";
    }

    private boolean isGenericCategory(String value) {
        return value.equals("음식점")
                || value.equals("식당")
                || value.equals("레스토랑")
                || value.equals("맛집");
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}