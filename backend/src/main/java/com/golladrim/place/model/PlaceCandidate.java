package com.golladrim.place.model;

public record PlaceCandidate(
        String placeName,
        String categoryName,
        String addressName,
        String roadAddressName,
        String phone,
        String placeUrl,
        Double latitude,
        Double longitude,
        Integer distance
) {}
