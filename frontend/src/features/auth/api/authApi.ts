import { axiosInstance } from "@/shared/api/axiosInstance";
import { AuthUser } from "../types/auth.types";

export const authApi = {
  async getMe() {
    const response = await axiosInstance.get<AuthUser>("/api/auth/me");
    return response.data;
  },

  async refresh() {
    const response = await axiosInstance.post("/api/auth/refresh");
    return response.data;
  },

  async logout() {
    const response = await axiosInstance.post("/api/auth/logout");
    return response.data;
  },
};
