import type { ApiResponse } from "~/types/auth";
import type {
  WardrobeCategory,
  WardrobeFormality,
  WardrobeStatus,
} from "~/types/wardrobe";

export type OutfitOccasion = string;

export interface OutfitRecommendationItem {
  id: string;
  category: WardrobeCategory;
  dominant_color?: string;
  description?: string;
  image_key?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  formality_level?: WardrobeFormality;
  occasion_tags?: string[];
  status?: WardrobeStatus;
}

export interface OutfitSet {
  top: OutfitRecommendationItem | null;
  bottom: OutfitRecommendationItem | null;
  outer: OutfitRecommendationItem | null;
  footwear: OutfitRecommendationItem | null;
}

export interface OutfitAlternative {
  rank?: number;
  candidate_id?: string;
  outfit: OutfitSet;
  reasoning: string;
  missing_gap: string | string[] | Record<string, unknown> | null;
}

export interface OutfitRecommendation extends OutfitAlternative {
  id: string;
  occasion: OutfitOccasion;
  candidate_id: string;
  candidate_count: number;
  recommendations: OutfitAlternative[];
  wardrobe_item_ids: string[];
  created_at: string;
}

export interface OutfitHistoryDetail {
  id: string;
  occasion: OutfitOccasion;
  recommended_items?: Partial<Record<WardrobeCategory, OutfitRecommendationItem>>;
  outfit?: OutfitSet;
  recommendations?: OutfitAlternative[];
  reasoning: string;
  missing_gap?: string | string[] | Record<string, unknown> | null;
  missing_categories?: string[];
  created_at: string;
}

export interface CreateOutfitRecommendationPayload {
  occasion: OutfitOccasion;
  top_k: number;
}

export type OutfitRecommendationResponse =
  ApiResponse<OutfitRecommendation>;
export type OutfitHistoryDetailResponse = ApiResponse<OutfitHistoryDetail | null>;
export interface OutfitHistoryResponse
  extends ApiResponse<OutfitRecommendation[]> {
  meta?: {
    total: number;
    limit: number;
  };
}
