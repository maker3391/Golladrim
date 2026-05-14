package com.golladrim.food.resolver;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ResolvedFoodIntent {

    private final Map<String, Set<String>> tagsByAxis = new HashMap<>();

    public void add(String axis, String value) {
        tagsByAxis.computeIfAbsent(axis, k -> new HashSet<>()).add(value);
    }

    public Map<String, Set<String>> getTagsByAxis() {
        return tagsByAxis;
    }

    public boolean isEmpty() {
        return tagsByAxis.isEmpty();
    }
}
