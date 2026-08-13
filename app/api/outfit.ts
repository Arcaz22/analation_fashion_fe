import { axiosInstance } from "~/api/axios";
import type {
  CreateOutfitRecommendationPayload,
  OutfitHistoryDetailResponse,
  OutfitHistoryResponse,
  OutfitRecommendationResponse,
} from "~/types/outfit";

export const outfitApi = {
  create: async (
    payload: CreateOutfitRecommendationPayload
  ): Promise<OutfitRecommendationResponse> => {
    const { data } = await axiosInstance.post<OutfitRecommendationResponse>(
      "/outfit-recommendations",
      payload
    );
    return data;
  },

  history: async (limit = 20): Promise<OutfitHistoryResponse> => {
    const { data } = await axiosInstance.get<OutfitHistoryResponse>(
      "/outfit-recommendations/history",
      {
        params: { limit },
      }
    );
    return data;
  },

  historyItem: async (
    historyId: string
  ): Promise<OutfitHistoryDetailResponse> => {
    const { data } = await axiosInstance.get<OutfitHistoryDetailResponse>(
      `/outfit-recommendations/history/${historyId}`
    );
    return data;
  },
};
