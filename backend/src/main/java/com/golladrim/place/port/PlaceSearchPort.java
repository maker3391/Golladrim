package com.golladrim.place.port;

import com.golladrim.place.model.PlaceCandidate;

import java.util.List;

public interface PlaceSearchPort {
    List<PlaceCandidate> search(String query, double latitude, double longitude, int radius);
}
