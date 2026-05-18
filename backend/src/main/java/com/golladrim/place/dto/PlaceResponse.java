package com.golladrim.place.dto;

public record PlaceResponse(
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
