import { axiosInstance } from "~/api/axios";
import type {
  AnalyzeBodyShapePayload,
  BodyShapeAnalyzeResponse,
  BodyShapeMetadataResponse,
  BodyShapeResponse,
  BodyShapeSaveResponse,
  SaveBodyShapePayload,
} from "~/types/bodyShape";

export const bodyShapeApi = {
  metadata: async (): Promise<BodyShapeMetadataResponse> => {
    const { data } = await axiosInstance.get<BodyShapeMetadataResponse>(
      "/profile/body-shape/metadata"
    );
    return data;
  },

  analyze: async (
    payload: AnalyzeBodyShapePayload
  ): Promise<BodyShapeAnalyzeResponse> => {
    const { data } = await axiosInstance.post<BodyShapeAnalyzeResponse>(
      "/profile/body-shape/analyze",
      payload
    );
    return data;
  },

  save: async (
    payload: SaveBodyShapePayload
  ): Promise<BodyShapeSaveResponse> => {
    const { data } = await axiosInstance.put<BodyShapeSaveResponse>(
      "/profile/body-shape",
      payload
    );
    return data;
  },

  get: async (): Promise<BodyShapeResponse> => {
    const { data } = await axiosInstance.get<BodyShapeResponse>(
      "/profile/body-shape"
    );
    return data;
  },
};
