package com.golladrim.food.repository;

import com.golladrim.food.domain.IntentKeyword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IntentKeywordRepository extends JpaRepository<IntentKeyword, Long> {
    List<IntentKeyword> findAllByEnabledTrue();
}
