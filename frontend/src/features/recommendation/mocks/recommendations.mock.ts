import { RecommendationPlace } from "@/features/recommendation/types/recommendation.types";

export const mockRecommendations: RecommendationPlace[] = [
  {
    id: 1,
    name: "달빛 이자카야",
    meta: "일식 주점 · 조용한 분위기",
    description: "퇴근 후 혼자 가볍게 한잔하기 좋은 근처 이자카야예요.",
    tags: ["혼술", "이자카야"],
    location: { latitude: 35.1579, longitude: 129.0597, name: "달빛 이자카야" },
  },
  {
    id: 2,
    name: "해운대 곰탕면옥",
    meta: "한식 · 든든한 국물",
    description: "속을 편하게 달래기 좋은 따뜻한 국물 메뉴가 강점이에요.",
    tags: ["해장", "한식"],
    location: { latitude: 35.1631, longitude: 129.1635, name: "해운대 곰탕면옥" },
  },
  {
    id: 3,
    name: "서면 숯불고기집",
    meta: "구이 · 캐주얼 데이트",
    description: "분위기는 편하고 메뉴 선택은 확실해서 데이트 한 끼로 좋아요.",
    tags: ["데이트", "구이"],
    location: { latitude: 35.1542, longitude: 129.0616, name: "서면 숯불고기집" },
  },
];
