import { axiosInstance } from "~/api/axios";
import type {
  AnalyzeSkinTonePayload,
  SaveSkinTonePayload,
  SkinToneAnalyzeResponse,
  SkinToneMetadataResponse,
  SkinToneResponse,
  SkinToneSaveResponse,
} from "~/types/skinTone";

export const skinToneApi = {
  metadata: async (): Promise<SkinToneMetadataResponse> => {
    const { data } = await axiosInstance.get<SkinToneMetadataResponse>(
      "/profile/skin-tone/metadata"
    );
    return data;
  },

  analyze: async (
    payload: AnalyzeSkinTonePayload
  ): Promise<SkinToneAnalyzeResponse> => {
    const { data } = await axiosInstance.post<SkinToneAnalyzeResponse>(
      "/profile/skin-tone/analyze",
      payload
    );
    return data;
  },

  save: async (payload: SaveSkinTonePayload): Promise<SkinToneSaveResponse> => {
    const { data } = await axiosInstance.put<SkinToneSaveResponse>(
      "/profile/skin-tone",
      payload
    );
    return data;
  },

  get: async (): Promise<SkinToneResponse> => {
    const { data } = await axiosInstance.get<SkinToneResponse>(
      "/profile/skin-tone"
    );
    return data;
  },
};
