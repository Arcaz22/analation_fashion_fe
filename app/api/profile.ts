import { axiosInstance } from "~/api/axios";
import type {
  UserProfileResponse,
  UserProfileStatsResponse,
} from "~/types/profile";

export const profileApi = {
  me: async (): Promise<UserProfileResponse> => {
    const { data } = await axiosInstance.get<UserProfileResponse>("/users/me");
    return data;
  },

  stats: async (): Promise<UserProfileStatsResponse> => {
    const { data } = await axiosInstance.get<UserProfileStatsResponse>(
      "/users/me/stats"
    );
    return data;
  },
};
