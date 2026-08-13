import type { ApiResponse } from "~/types/auth";

export type WardrobeCategory =
  | "accessory"
  | "bottom"
  | "footwear"
  | "outer"
  | "top";

export type WardrobeFormality = "casual" | "smart-casual" | "formal";

export type WardrobeStatus =
  | "active"
  | "archived"
  | "laundry"
  | "unavailable";

export interface WardrobeItem {
  id: string;
  category: WardrobeCategory;
  dominant_color: string;
  description: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  formality_level: WardrobeFormality;
  occasion_tags: string[];
  status: WardrobeStatus;
  is_active?: boolean;
  width?: number;
  height?: number;
  size_bytes?: number;
}

export interface WardrobeMetadata {
  categories: WardrobeCategory[];
  formality_levels: WardrobeFormality[];
  statuses: WardrobeStatus[];
}

export interface WardrobeItemsResponse extends ApiResponse<WardrobeItem[]> {
  meta?: {
    total: number;
  };
}

export interface CreateWardrobeItemPayload {
  image: File;
  category: WardrobeCategory;
  dominant_color: string;
  description?: string;
  formality_level?: WardrobeFormality;
  occasion_tags: string[];
  status?: WardrobeStatus;
}

export type UpdateWardrobeItemPayload = Partial<
  Pick<
    WardrobeItem,
    | "category"
    | "dominant_color"
    | "description"
    | "formality_level"
    | "occasion_tags"
    | "status"
  >
>;

export interface WardrobeAnalyzeResult {
  category: WardrobeCategory;
  dominant_color: string;
  description: string;
}

export type WardrobeItemResponse = ApiResponse<WardrobeItem | null>;
export type WardrobeAnalyzeResponse = ApiResponse<WardrobeAnalyzeResult>;
export type WardrobeMetadataResponse = ApiResponse<WardrobeMetadata>;
export type DeleteWardrobeItemResponse = ApiResponse<{ deleted: boolean }>;
