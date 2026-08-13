import { axiosInstance } from "~/api/axios";
import type {
  CreateWardrobeItemPayload,
  DeleteWardrobeItemResponse,
  UpdateWardrobeItemPayload,
  WardrobeAnalyzeResponse,
  WardrobeCategory,
  WardrobeItemResponse,
  WardrobeItemsResponse,
  WardrobeMetadataResponse,
} from "~/types/wardrobe";

export const wardrobeApi = {
  metadata: async (): Promise<WardrobeMetadataResponse> => {
    const { data } = await axiosInstance.get<WardrobeMetadataResponse>(
      "/wardrobe/items/metadata"
    );
    return data;
  },

  items: async (category?: WardrobeCategory): Promise<WardrobeItemsResponse> => {
    const { data } = await axiosInstance.get<WardrobeItemsResponse>(
      "/wardrobe/items",
      {
        params: category ? { category } : undefined,
      }
    );
    return data;
  },

  createItem: async (
    payload: CreateWardrobeItemPayload
  ): Promise<WardrobeItemResponse> => {
    const formData = new FormData();
    formData.append("image", payload.image);
    formData.append("category", payload.category);
    formData.append("dominant_color", payload.dominant_color);
    formData.append("occasion_tags", payload.occasion_tags.join(","));

    const description = payload.description?.trim();
    if (description) {
      formData.append("description", description);
    }

    if (payload.formality_level) {
      formData.append("formality_level", payload.formality_level);
    }

    if (payload.status) {
      formData.append("status", payload.status);
    }

    const { data } = await axiosInstance.post<WardrobeItemResponse>(
      "/wardrobe/items",
      formData
    );
    return data;
  },

  analyzeItem: async (image: File): Promise<WardrobeAnalyzeResponse> => {
    const formData = new FormData();
    formData.append("image", image);

    const { data } = await axiosInstance.post<WardrobeAnalyzeResponse>(
      "/wardrobe/items/analyze",
      formData
    );
    return data;
  },

  item: async (itemId: string): Promise<WardrobeItemResponse> => {
    const { data } = await axiosInstance.get<WardrobeItemResponse>(
      `/wardrobe/items/${itemId}`
    );
    return data;
  },

  updateItem: async (
    itemId: string,
    payload: UpdateWardrobeItemPayload
  ): Promise<WardrobeItemResponse> => {
    const { data } = await axiosInstance.patch<WardrobeItemResponse>(
      `/wardrobe/items/${itemId}`,
      payload
    );
    return data;
  },

  deleteItem: async (itemId: string): Promise<DeleteWardrobeItemResponse> => {
    const { data } = await axiosInstance.delete<DeleteWardrobeItemResponse>(
      `/wardrobe/items/${itemId}`
    );
    return data;
  },
};
