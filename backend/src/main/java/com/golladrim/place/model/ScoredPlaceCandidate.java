package com.golladrim.place.model;

public record ScoredPlaceCandidate(
        PlaceCandidate candidate,
        int score
) {}
