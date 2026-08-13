import type { ApiResponse } from "~/types/auth";
import type { BodyShapeAnalysis } from "~/types/bodyShape";
import type { SkinToneAnalysis } from "~/types/skinTone";

export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
  member_since?: string;
  profile_completed: boolean;
  skin_tone: SkinToneAnalysis | null;
  body_shape: BodyShapeAnalysis | null;
}

export interface UserProfileStats {
  total_items: number;
  total_recommendations: number;
  total_favorites: number;
  active_days: number;
}

export interface UpdateUserProfilePayload {
  name: string;
}

export interface UpdateUserProfileData {
  id: number | string;
  name: string;
  email: string;
}

export type UserProfileResponse = ApiResponse<UserProfile>;
export type UserProfileStatsResponse = ApiResponse<UserProfileStats>;
export type UpdateUserProfileResponse = ApiResponse<UpdateUserProfileData>;
