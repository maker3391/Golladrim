package com.golladrim.place.client;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record KakaoGeocodeResponse(
        List<Document> documents
) {
    public record Document(
            Address address,

            @JsonProperty("road_address")
            RoadAddress roadAddress
    ) {}

    public record Address(
            @JsonProperty("region_1depth_name")
            String region1DepthName,

            @JsonProperty("region_2depth_name")
            String region2DepthName,

            @JsonProperty("region_3depth_name")
            String region3DepthName
    ) {}

    public record RoadAddress(
            @JsonProperty("region_2depth_name")
            String region2DepthName
    ) {}
}
