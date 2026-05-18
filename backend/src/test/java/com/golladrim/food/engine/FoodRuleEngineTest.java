package com.golladrim.food.engine;

import com.golladrim.food.domain.FoodItem;
import com.golladrim.food.dto.RecommendStatus;
import com.golladrim.food.resolver.ResolvedFoodIntent;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FoodRuleEngineTest {

    private final FoodRuleEngine foodRuleEngine = new FoodRuleEngine();

    @Test
    void excludedFoodIdsAreRemovedFromCandidates() {
        FoodItem excluded = foodItem(1L, "제외 메뉴", new String[]{"매콤"});
        FoodItem candidate = foodItem(2L, "추천 메뉴", new String[]{"매콤"});
        ResolvedFoodIntent intent = intent("taste", "매콤");

        FoodRuleEngineResult result = foodRuleEngine.recommendWithStatus(
                List.of(excluded, candidate),
                intent,
                List.of(1L)
        );

        assertThat(result.status()).isEqualTo(RecommendStatus.SUCCESS);
        assertThat(result.items()).extracting("id").doesNotContain(1L);
        assertThat(result.items()).extracting("id").contains(2L);
    }

    @Test
    void fallbackStatusIsReturnedWhenAllCandidatesAreExcluded() {
        FoodItem excluded = foodItem(1L, "제외 메뉴", new String[]{"매콤"});
        ResolvedFoodIntent intent = intent("taste", "매콤");

        FoodRuleEngineResult result = foodRuleEngine.recommendWithStatus(
                List.of(excluded),
                intent,
                List.of(1L)
        );

        assertThat(result.status()).isEqualTo(RecommendStatus.FALLBACK);
        assertThat(result.items()).isEmpty();
    }

    @Test
    void fallbackStatusIsReturnedWhenThereIsNoMatchingScore() {
        FoodItem candidate = foodItem(1L, "담백 메뉴", new String[]{"담백"});
        ResolvedFoodIntent intent = intent("taste", "매콤");

        FoodRuleEngineResult result = foodRuleEngine.recommendWithStatus(
                List.of(candidate),
                intent,
                List.of()
        );

        assertThat(result.status()).isEqualTo(RecommendStatus.FALLBACK);
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().getFirst().score()).isZero();
    }

    @Test
    void successStatusIsReturnedWhenThereIsAMatch() {
        FoodItem candidate = foodItem(1L, "매콤 메뉴", new String[]{"매콤"});
        ResolvedFoodIntent intent = intent("taste", "매콤");

        FoodRuleEngineResult result = foodRuleEngine.recommendWithStatus(
                List.of(candidate),
                intent,
                List.of()
        );

        assertThat(result.status()).isEqualTo(RecommendStatus.SUCCESS);
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().getFirst().score()).isGreaterThan(0);
    }

    @Test
    void tiedCandidatesAreReturnedWithoutError() {
        ResolvedFoodIntent intent = intent("taste", "매콤");
        List<FoodItem> candidates = List.of(
                foodItem(1L, "메뉴 1", new String[]{"매콤"}),
                foodItem(2L, "메뉴 2", new String[]{"매콤"}),
                foodItem(3L, "메뉴 3", new String[]{"매콤"}),
                foodItem(4L, "메뉴 4", new String[]{"매콤"})
        );

        FoodRuleEngineResult result = foodRuleEngine.recommendWithStatus(candidates, intent, List.of());

        assertThat(result.status()).isEqualTo(RecommendStatus.SUCCESS);
        assertThat(result.items()).hasSize(3);
        assertThat(result.items()).allSatisfy(item -> assertThat(item.score()).isGreaterThan(0));
    }

    private ResolvedFoodIntent intent(String axis, String value) {
        ResolvedFoodIntent intent = new ResolvedFoodIntent();
        intent.add(axis, value);
        return intent;
    }

    private FoodItem foodItem(Long id, String name, String[] taste) {
        FoodItem item = newFoodItem();
        ReflectionTestUtils.setField(item, "id", id);
        ReflectionTestUtils.setField(item, "name", name);
        ReflectionTestUtils.setField(item, "taste", taste);
        ReflectionTestUtils.setField(item, "enabled", true);
        return item;
    }

    private FoodItem newFoodItem() {
        try {
            Constructor<FoodItem> constructor = FoodItem.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            return constructor.newInstance();
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("FoodItem test fixture creation failed.", e);
        }
    }
}
