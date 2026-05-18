import { axiosInstance } from "@/shared/api/axiosInstance";
import { GeocodeResponse } from "@/features/recommendation/types/recommendation.types";

export async function fetchGeocode(lat: number, lng: number): Promise<string> {
  try {
    const { data } = await axiosInstance.get<GeocodeResponse>(
      "/api/places/geocode",
      {
        params: { lat, lng },
      },
    );

    return data.address ?? "";
  } catch {
    return "";
  }
}
