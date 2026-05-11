# Golladrim

“뭐먹지?”에서 시작하는 추천 서비스

Golladrim은 음식 추천을 시작으로  
장소 추천, 숙소 추천, 사용자 취향 기반 추천까지 확장 가능한 구조를 목표로 하는 추천 서비스입니다.

단순히 결과 하나를 반환하는 것이 아니라,  
사용자의 다음 행동까지 자연스럽게 이어지는 추천 흐름 설계를 목표로 합니다.

---

## MVP

- 음식 추천
- 재추천(다른거 / 싫어요)
- 음식 기반 장소 추천
- 지도 기반 위치 확인

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- TanStack Query
- Zustand

### Backend
- Java 21
- Spring Boot
- JPA
- MariaDB
- Redis

---

## Goal

- 확장 가능한 추천 구조 설계
- Rule 기반 추천 시스템
- 최소한의 LLM 사용 전략
- 낮은 결합도와 높은 응집도 유지
- 음식 → 장소 → 숙소 흐름 확장

---

## Architecture Direction

Golladrim은 다음 방향을 중심으로 설계합니다.

- Controller는 요청/응답만 담당
- 추천 흐름은 Service/Facade에서 조립
- Rule 기반 추천 우선 처리
- LLM은 자연어 해석과 요약 보조 역할만 수행
- 외부 API 의존성을 분리하여 확장 가능하게 설계

---

## Future Plans

- 사용자 선호도 기반 추천
- 상황 기반 추천
- 다중 장소 API 통합
- 리뷰 기반 요약
- 추천 이력 기반 개인화