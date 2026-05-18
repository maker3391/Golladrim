package com.golladrim.place.model;

public record PlaceKeywordRule(
        String keyword,
        int weight,
        PlaceKeywordMatchType matchType
) {}
