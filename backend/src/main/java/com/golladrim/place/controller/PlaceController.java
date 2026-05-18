package com.golladrim.place.controller;

import com.golladrim.place.dto.GeocodeResponse;
import com.golladrim.place.dto.PlaceRecommendRequest;
import com.golladrim.place.dto.PlaceRecommendResponse;
import com.golladrim.place.service.PlaceRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceRecommendationService placeRecommendationService;

    @PostMapping("/recommend")
    public ResponseEntity<PlaceRecommendResponse> recommend(@Valid @RequestBody PlaceRecommendRequest request) {
        return ResponseEntity.ok(placeRecommendationService.recommend(request));
    }

    @GetMapping("/geocode")
    public ResponseEntity<GeocodeResponse> geocode(
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        return ResponseEntity.ok(placeRecommendationService.reverseGeocode(lat, lng));
    }
}
