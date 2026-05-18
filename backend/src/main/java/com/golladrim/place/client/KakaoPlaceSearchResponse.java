package com.golladrim.place.client;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record KakaoPlaceSearchResponse(
        List<Document> documents
) {
    public record Document(
            @JsonProperty("place_name")
            String placeName,

            @JsonProperty("category_name")
            String categoryName,

            @JsonProperty("address_name")
            String addressName,

            @JsonProperty("road_address_name")
            String roadAddressName,

            String phone,

            @JsonProperty("place_url")
            String placeUrl,

            String x,
            String y,
            String distance
    ) {}
}
