package com.golladrim.place.dto;

import java.util.List;

public record PlaceRecommendResponse(
        Long foodId,
        String foodName,
        List<PlaceResponse> places,
        String message
) {
    public PlaceRecommendResponse {
        places = places == null ? List.of() : List.copyOf(places);
    }
}
