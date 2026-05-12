export type Provider = "GOOGLE" | "KAKAO";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  nickname: string;
  provider: Provider;
  role: "USER" | "ADMIN";
}

