# Golladrim

> 대화 흐름 기반 음식 추천 서비스. 모호한 표현을 메뉴 추천으로 연결합니다.

<p align="center">
  <a href="https://golladrim.com">
    <img src="https://img.shields.io/badge/Live_Demo-golladrim.com-111827?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/maker3391/Golladrim">
    <img src="https://img.shields.io/badge/GitHub-Golladrim-111827?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white" />
</p>

<br />

<p align="center">
  <img
    src="./frontend/docs/images/golladrim-main.png"
    alt="Golladrim main screen"
    width="1100"
  />
</p>

---

## 프로젝트 개요

**Golladrim(골라드림)** 은 사용자의 현재 상황과 취향을 대화로 입력받아 음식 메뉴를 추천하고, 장소까지 연결하는 추천 흐름 플랫폼입니다.

많은 추천 서비스는 사용자가 원하는 메뉴나 장소를 이미 알고 있다는 전제에서 출발합니다. 골라드림은 "배고픈데 뭘 먹어야 할지 모르겠다", "오늘은 가볍게 먹고 싶다"처럼 모호하게 시작되는 입력을 구조화된 추천 조건으로 변환하고, Rule 기반 필터링과 AI 해석을 조합해 일관된 결과를 만듭니다.

---

## Live Demo

서비스는 **[https://golladrim.com](https://golladrim.com)** 에서 확인할 수 있습니다.

Frontend는 Vercel에 배포되어 있으며, Google 또는 Kakao 소셜 로그인으로 이용할 수 있습니다.

---

## 문제 정의

음식 선택은 단순 검색보다 의사결정에 가깝습니다.

| 기존 방식 | 한계 |
| --- | --- |
| 키워드 검색 | 원하는 메뉴를 이미 알아야 함 |
| 별점/리뷰 기반 | 상황, 동행, 날씨 같은 맥락 반영 약함 |
| 랜덤 추천 | 결과의 설득력과 재사용성 낮음 |
| AI 단독 추천 | 조건 검증과 필터링 로직이 약해질 수 있음 |

골라드림은 **AI의 자연어 해석**과 **Rule 기반 추천 파이프라인**을 분리해 이 한계를 줄이고 있습니다.

---

## 기술 스택

### Frontend

| 역할 | 기술 |
| --- | --- |
| App Framework | ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) |
| UI Runtime | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| Server State | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white) |
| Client State | ![Zustand](https://img.shields.io/badge/Zustand-5-443E38) |
| HTTP Client | ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4) |
| Styling | ![CSS Modules](https://img.shields.io/badge/CSS_Modules-Scoped_CSS-1572B6?logo=css3&logoColor=white) |

### Backend

| 역할 | 기술 |
| --- | --- |
| Language | ![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white) |
| Framework | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white) |
| Security | ![Spring Security](https://img.shields.io/badge/Spring_Security-OAuth2_+_JWT-6DB33F?logo=springsecurity&logoColor=white) |
| Persistence | ![JPA](https://img.shields.io/badge/JPA-Hibernate-59666C?logo=hibernate&logoColor=white) |
| Migration | ![Flyway](https://img.shields.io/badge/Flyway-V1~V5-CC0200?logo=flyway&logoColor=white) |
| Array Type | ![hypersistence-utils](https://img.shields.io/badge/hypersistence--utils-3.7-blue) |
| Token Store | ![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white) |
| AI Extension | ![Spring AI](https://img.shields.io/badge/Spring_AI-Redis_Vector_Store-6DB33F) |

### Database / Infra

| 역할 | 기술 |
| --- | --- |
| RDBMS | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white) |
| Cache / Token | ![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white) |
| Image Storage | ![Supabase](https://img.shields.io/badge/Supabase_Storage-food_bucket-3ECF8E?logo=supabase&logoColor=white) |
| Container | ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white) |
| Deployment | ![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white) |

---

## 현재 진행 상태

### Completed

**인증 / 사용자**
- Google / Kakao OAuth2 로그인 흐름
- JWT Access Token + Refresh Token 발급 및 갱신
- Refresh Token Redis 저장 + TTL 기반 만료 관리
- HttpOnly Cookie 기반 토큰 전달
- 사용자 정보 조회 / 닉네임 변경 / 로그아웃 API
- 관리자용 사용자 조회 / 권한 변경 / 정지·해제 API

**음식 추천**
- `food_categories` / `food_items` 도메인 모델링 (TEXT[] 태그 컬럼)
- `intent_keywords` 기반 자연어 태그 추출
- Rule 기반 음식 추천 엔진 (축별 가중치 + 동점 셔플 + Fallback)
- `excludedFoodIds` (Long 배열) 기반 제외 음식 처리
- `RecommendStatus.SUCCESS` / `FALLBACK` 구분
- `POST /api/foods/recommend` API
- Flyway V1 ~ V5 마이그레이션

**Frontend UX**
- 랜딩 페이지 UI
- 채팅 패널 + 지도 패널 기반 추천 메인 레이아웃
- `ThinkingIndicator` — AI 처리 중 상태 표시
- `TypingText` — 추천 결과 타이핑 애니메이션
- `FoodCard` fade-in 전환 애니메이션
- 최소 로딩 딜레이로 응답 속도와 무관한 일관된 UX 유지
- 👍 / 👎 피드백 흐름
- `ChatMessage` union 타입 기반 채팅 메시지 구조
- `useFoodRecommendation` 커스텀 훅
- Supabase Storage CDN 기반 음식 이미지 로드

### In Progress

- 채팅 기반 추천 흐름 고도화

### Planned

- LLM 연동으로 자연어 추천 근거 생성 및 대화형 흐름 구현
- 장소 추천 연동 (Kakao Place API + 지도 시각화)
- 사용자 선호도 / 추천 이력 / 피드백 저장
- Swagger / OpenAPI 문서화
- 배포 환경 구성 (Backend)

---

## 시스템 아키텍처

```plaintext
┌──────────────────────────────┐
│          Frontend            │
│  Next.js / React / TS        │
│  Chat UI + Map Layout        │
│  Deployed on Vercel          │
└──────────────┬───────────────┘
               │
               │ HTTPS / Cookie / JSON
               ▼
┌──────────────────────────────┐
│         Backend API          │
│  Spring Boot / Security      │
│  Auth / User / Food          │
└────────┬─────────┬───────────┘
         │         │
         ▼         ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │
│ User Data   │  │  Token TTL  │
│ Food/Intent │  │  Cache      │
└─────────────┘  └─────────────┘

┌──────────────────────────────┐
│      Supabase Storage        │
│  food bucket (CDN)           │
│  image_url → food_items      │
└──────────────────────────────┘
```

- **Frontend**: 채팅과 지도를 중심으로 추천 경험을 구성합니다. Vercel에 배포되어 있습니다.
- **Backend**: 인증, 사용자, 추천 도메인을 분리한 Spring Boot API 서버입니다.
- **PostgreSQL**: 사용자, 음식 카테고리/아이템, 키워드 매핑 등 영속성 데이터를 담당합니다. TEXT[] 타입으로 다중 태그를 컬럼 단위로 관리합니다.
- **Redis**: Refresh Token 저장 및 TTL 관리에 사용합니다.
- **Supabase Storage**: `food` 버킷을 통해 음식 이미지를 CDN으로 제공합니다. `food_items.image_url`에 공개 URL을 저장하고 Frontend에서 직접 참조합니다.

---

## 추천 엔진

현재는 Rule 기반 추천 엔진이 구현되어 있습니다. 향후 LLM 연동으로 자연어 근거 생성을 추가할 예정입니다.

### 처리 흐름

```plaintext
사용자 입력
  예: "오늘 비 오는데 매운 거 말고 따뜻한 음식 먹고 싶어"
        │
        ▼
FoodIntentResolver
  - intent_keywords 테이블 기반 태그 추출
  - tag_axis / tag_value 구조로 의도 구조화
        │
        ▼
FoodRuleEngine
  - excludedFoodIds (Long 배열) 기반 후보 제외
  - 축별 가중치 × 태그 매칭으로 점수 산출
  - 동점 그룹 랜덤 셔플
  - score == 0이면 전체 음식 랜덤 Fallback
        │
        ▼
추천 결과
  - RecommendStatus: SUCCESS / FALLBACK
  - Top 3 음식 + matchedTags + reason
```

### 축별 가중치

| 축 | 가중치 | 예시 태그 |
| --- | :---: | --- |
| `situation` | **5** | 해장, 회식, 혼밥 |
| `taste` | **5** | 매운, 담백한, 달콤한 |
| `mood` | **4** | 우울한, 즐거운, 피곤한 |
| `weather` | **4** | 비오는날, 더운날, 추운날 |
| `format` | **3** | 국물, 볶음, 구이 |
| `temperature` | **3** | 뜨거운, 차가운 |
| `fullness` | **3** | 든든한, 가벼운 |
| `ingredient` | **2** | 고기, 해산물, 채소 |
| `nation` | **2** | 한식, 일식, 양식 |
| `health_style` | **1** | 저칼로리, 고단백 |
| `season` | **1** | 여름, 겨울 |

### excludedFoodIds 처리

요청에 `excludedFoodIds: [1, 5, 12]` 같은 Long 배열을 포함하면 해당 음식은 후보에서 제외됩니다. 이전 추천 결과나 사용자가 원하지 않는 음식을 재추천하지 않도록 합니다.

### FALLBACK 흐름

모든 음식의 매칭 점수가 0인 경우 전체 음식 목록에서 랜덤으로 Top 3를 반환합니다. 응답의 `status` 필드가 `"FALLBACK"`으로 구분되어 Frontend에서 다르게 처리할 수 있습니다.

### Rule 기반 + AI 조합 설계

| 영역 | 현재 | 예정 |
| --- | --- | --- |
| 자연어 해석 | Rule (intent_keywords) | AI (LLM) |
| 추천 조건 검증 | Rule | Rule |
| 후보군 필터링 | Rule | Rule |
| 추천 이유 생성 | Rule (template) | AI (LLM) |
| 사용자 피드백 반영 | — | Rule + AI |

---

## 핵심 기능

### 사용자 경험 (UX)

채팅 기반 추천 흐름에서 다음 UX 요소가 구현되어 있습니다.

| 컴포넌트 / 기능 | 설명 |
| --- | --- |
| `ThinkingIndicator` | AI 처리 중 상태를 시각적으로 표시 |
| `TypingText` | 추천 결과 메시지를 타이핑 애니메이션으로 표시 |
| `FoodCard` | 추천 음식 카드를 fade-in으로 순차 전환 |
| 최소 로딩 딜레이 | 빠른 응답 시에도 자연스러운 흐름 유지 |
| 👍 / 👎 피드백 | 추천 결과에 대한 즉시 피드백 흐름 |
| `ChatMessage` union 타입 | 텍스트, 추천 카드, 시스템 메시지를 하나의 타입으로 관리 |
| `useFoodRecommendation` | 추천 요청 상태와 결과를 관리하는 커스텀 훅 |

### 인증 / 사용자

- Google, Kakao OAuth2 로그인
- JWT Access Token / Refresh Token 발급 및 갱신
- Refresh Token Redis 저장 (TTL: 14일)
- HttpOnly Cookie 기반 인증
- 사용자 정보 조회, 닉네임 변경, 로그아웃

### 음식 추천

- 자연어 메시지 기반 의도 태그 추출 (`intent_keywords`)
- 축별 가중치 기반 음식 매칭 점수 계산
- 동점 그룹 랜덤 셔플로 매 요청마다 다양한 결과 제공
- `excludedFoodIds` (Long 배열) 기반 제외 음식 처리
- `RecommendStatus.SUCCESS` / `FALLBACK` 구분

### 관리자

- 사용자 목록 / 상세 조회
- 사용자 권한 변경
- 사용자 정지 및 정지 해제

---

## 인증 흐름

```plaintext
1. 사용자가 Google / Kakao OAuth2 로그인을 요청합니다.
2. Spring Security OAuth2 Client가 Provider 인증을 처리합니다.
3. OAuth2 사용자 정보를 조회하거나 신규 사용자를 생성합니다.
4. Backend가 Access Token과 Refresh Token을 발급합니다.
5. Token은 HttpOnly Cookie로 Frontend에 전달됩니다.
6. Refresh Token은 Redis에 저장되고 TTL로 만료를 관리합니다.
7. 이후 API 요청은 JWT 인증 필터를 통해 처리됩니다.
```

```plaintext
Frontend → /oauth2/authorization/{provider}
         → OAuth2 Provider
         → OAuth2 Success Handler
         → JWT 발급 + Redis Refresh Token 저장
         → Frontend /oauth2/callback redirect
```

**OAuth2 + JWT를 선택한 이유**

- **OAuth2**: 소셜 로그인으로 진입 장벽을 낮추고 비밀번호 저장 책임을 제거합니다.
- **JWT**: Backend API를 stateless에 가깝게 유지하면서 인증 정보를 전달합니다.
- **Redis Refresh Token**: 서버 측에서 만료, 재발급, 강제 로그아웃을 제어합니다.
- **HttpOnly Cookie**: 브라우저 스크립트에서 토큰에 직접 접근하지 못하도록 합니다.

---

## 데이터베이스 / 스토리지

### PostgreSQL

영속성이 필요한 데이터를 담당합니다. TEXT[] 타입으로 음식 태그를 컬럼 단위로 관리하며, Flyway V1 ~ V5 마이그레이션으로 스키마를 관리합니다.

### Redis

| 사용 지점 | 목적 |
| --- | --- |
| Refresh Token Store | 로그아웃, 재발급, 만료 제어를 서버 측에서 관리 |
| TTL | 토큰 만료 시간 자동 관리 |
| Cache (예정) | 추천 조건, 장소 후보, 사용자 컨텍스트 캐싱 |
| Vector Store (예정) | Spring AI Redis Vector Store 기반 컨텍스트 검색 |

### Supabase Storage

음식 이미지는 Supabase Storage의 `food` 버킷을 통해 CDN으로 제공됩니다.

```plaintext
Supabase Storage
  └─ food bucket (public)
       └─ /images/{food_item_id}.jpg
            └─ CDN URL → food_items.image_url 컬럼에 저장

Frontend
  └─ food_items.image_url을 직접 참조해 이미지를 렌더링
```

---

## 디렉토리 구조

```tree
Golladrim
├── backend
│   ├── docker-compose.yml
│   ├── build.gradle
│   ├── settings.gradle
│   └── src
│       ├── main
│       │   ├── java/com/golladrim
│       │   │   ├── auth          # OAuth2, JWT, Redis
│       │   │   ├── common        # Config, Exception, Response
│       │   │   ├── food          # 추천 엔진, Intent Resolver
│       │   │   └── user          # 사용자 도메인
│       │   └── resources
│       │       └── db/migration  # Flyway V1~V5
│       └── test
├── frontend
│   ├── docs/images
│   ├── public
│   └── src
│       ├── app
│       ├── components
│       │   ├── common
│       │   ├── landing
│       │   └── layout
│       ├── features
│       │   ├── auth
│       │   ├── map
│       │   └── recommendation    # ChatMessage, FoodCard, useFoodRecommendation
│       └── shared
└── README.md
```

---

## 로컬 실행 방법

### 1. Repository Clone

```bash
git clone https://github.com/maker3391/Golladrim.git
cd Golladrim
```

### 2. Docker 기반 인프라 실행

Redis는 `backend/docker-compose.yml`로 실행합니다.

```bash
cd backend
docker compose up -d
```

```plaintext
PostgreSQL: localhost:5432
Redis:      localhost:6379
```

### 3. Backend 실행

```bash
# macOS / Linux
cd backend
./gradlew bootRun

# Windows PowerShell
cd backend
.\gradlew.bat bootRun
```

Backend: `http://localhost:8080`

### 4. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### 5. 환경 변수

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-map-app-key
```

> 로컬 OAuth2 Client 정보와 JWT Secret은 개발 환경에서만 사용합니다. 운영 환경에서는 환경 변수 또는 Secret Manager로 분리할 예정입니다.

---

## API 문서

Swagger / OpenAPI 문서는 추후 추가 예정입니다.

### Auth

```http
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
PATCH  /api/auth/me/nickname
```

### Admin

```http
GET    /api/admin/users
GET    /api/admin/users/{userId}
PATCH  /api/admin/users/{userId}/ban
PATCH  /api/admin/users/{userId}/release-ban
PATCH  /api/admin/users/{userId}/role
```

### Food

```http
POST   /api/foods/recommend
```

**Request**
```json
{
  "message": "비오는 날 해장하고 싶어",
  "excludedFoodIds": [3, 7]
}
```

**Response**
```json
{
  "status": "SUCCESS",
  "items": [
    {
      "id": 1,
      "name": "돼지국밥",
      "categoryName": "한식",
      "imageUrl": "https://xxx.supabase.co/storage/v1/object/public/food/images/1.jpg",
      "score": 18,
      "matchedTags": ["해장", "국물", "비오는날"],
      "reason": "해장, 국물, 비오는날 조건과 잘 맞는 메뉴입니다."
    }
  ]
}
```

### Recommendation (Planned)

```http
POST   /api/recommendations                  # Planned
GET    /api/recommendations/{id}             # Planned
POST   /api/recommendations/{id}/feedback    # Planned
```

---

## ERD

### Users

```plaintext
users
 ├─ id             BIGSERIAL PK
 ├─ email          VARCHAR(100)
 ├─ name           VARCHAR(50) NOT NULL
 ├─ nickname       VARCHAR(30) NOT NULL UNIQUE
 ├─ provider       VARCHAR(20) NOT NULL  -- GOOGLE | KAKAO
 ├─ provider_id    VARCHAR(100) NOT NULL
 ├─ role           VARCHAR(20) NOT NULL  -- USER | ADMIN
 ├─ status         VARCHAR(20) NOT NULL  -- ACTIVE | BANNED | DELETED
 ├─ banned_until   TIMESTAMP
 ├─ ban_reason     VARCHAR(255)
 ├─ created_at     TIMESTAMP NOT NULL
 └─ updated_at     TIMESTAMP NOT NULL
```

### Food

```plaintext
food_categories
 ├─ id          BIGSERIAL PK
 ├─ name        VARCHAR UNIQUE NOT NULL
 ├─ enabled     BOOLEAN NOT NULL DEFAULT true
 ├─ created_at  TIMESTAMP NOT NULL
 └─ updated_at  TIMESTAMP NOT NULL

food_items
 ├─ id           BIGSERIAL PK
 ├─ category_id  BIGINT FK → food_categories.id
 ├─ name         VARCHAR NOT NULL
 ├─ image_url    VARCHAR          -- Supabase Storage CDN URL
 ├─ situation    TEXT[]           -- 상황 태그 (해장, 회식 ...)
 ├─ weather      TEXT[]           -- 날씨 태그 (비오는날, 더운날 ...)
 ├─ taste        TEXT[]           -- 맛 태그 (매운, 담백한 ...)
 ├─ fullness     TEXT[]           -- 포만감 태그 (든든한, 가벼운 ...)
 ├─ mood         TEXT[]           -- 기분 태그 (우울한, 즐거운 ...)
 ├─ nation       TEXT[]           -- 국가 태그 (한식, 일식 ...)
 ├─ ingredient   TEXT[]           -- 재료 태그 (고기, 해산물 ...)
 ├─ format       TEXT[]           -- 형태 태그 (국물, 볶음 ...)
 ├─ temperature  TEXT[]           -- 온도 태그 (뜨거운, 차가운 ...)
 ├─ health_style TEXT[]           -- 건강 태그 (저칼로리, 고단백 ...)
 ├─ season       TEXT[]           -- 계절 태그 (여름, 겨울 ...)
 ├─ enabled      BOOLEAN NOT NULL DEFAULT true
 ├─ created_at   TIMESTAMP NOT NULL
 └─ updated_at   TIMESTAMP NOT NULL

intent_keywords
 ├─ id          BIGSERIAL PK
 ├─ tag_axis    VARCHAR(50) NOT NULL  -- 매핑 대상 축 (weather, taste ...)
 ├─ tag_value   VARCHAR(50) NOT NULL  -- 매핑 태그 값 (비오는날, 매운 ...)
 ├─ keywords    TEXT[] NOT NULL       -- 인식할 자연어 키워드 목록
 ├─ enabled     BOOLEAN NOT NULL DEFAULT true
 ├─ created_at  TIMESTAMP NOT NULL
 └─ updated_at  TIMESTAMP NOT NULL
```

### Auth (Redis)

```plaintext
RefreshToken (Redis)
 ├─ key:   refresh_token:{userId}
 ├─ value: token string
 └─ TTL:   14일
```

---

## 향후 확장 방향

- LLM 연동으로 자연어 추천 근거 생성 및 대화형 흐름 구현
- 장소 추천 연동 (Kakao Place API + 지도 시각화)
- 추천 도메인을 `menu`, `place`, `recommendation`, `feedback` 단위로 분리
- 사용자 입력을 구조화된 추천 조건으로 변환하는 Request Parser 고도화
- 추천 결과에 대한 사용자 피드백을 선호도 모델에 반영
- Redis Cache 및 Vector Store를 활용한 컨텍스트 검색 실험
- Swagger / OpenAPI 기반 API 문서 자동화
- 운영 환경용 Secret 관리 및 배포 파이프라인 구성
