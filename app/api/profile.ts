import { axiosInstance } from "~/api/axios";
import type {
  UpdateUserProfilePayload,
  UpdateUserProfileResponse,
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

  update: async (
    payload: UpdateUserProfilePayload
  ): Promise<UpdateUserProfileResponse> => {
    const { data } = await axiosInstance.put<UpdateUserProfileResponse>(
      "/users/me",
      payload
    );
    return data;
  },
};
