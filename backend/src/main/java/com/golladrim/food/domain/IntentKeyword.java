package com.golladrim.food.domain;

import com.golladrim.common.domain.BaseEntity;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "intent_keywords")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IntentKeyword extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tag_axis", nullable = false, length = 50)
    private String tagAxis;

    @Column(name = "tag_value", nullable = false, length = 50)
    private String tagValue;

    @Column(columnDefinition = "text[]", nullable = false)
    @Type(value = StringArrayType.class)
    private String[] keywords;

    @Column(nullable = false)
    private boolean enabled = true;
}
