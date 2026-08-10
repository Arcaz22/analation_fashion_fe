import type { ApiResponse } from "~/types/auth";

export type SkinToneInputMethod = "manual" | "camera";
export type SkinToneSampleArea = "face" | "neck" | "inner_arm" | "body";
export type SkinToneUndertone = "Warm" | "Cool" | "Neutral";
export type SkinToneSeasonLabel = "Spring" | "Summer" | "Autumn" | "Winter";

export interface SkinToneMetadata {
  sample_areas: SkinToneSampleArea[];
  undertones: SkinToneUndertone[];
  season_labels: SkinToneSeasonLabel[];
}

export interface SkinToneAnalysis {
  input_method: SkinToneInputMethod;
  sample_area: SkinToneSampleArea;
  tone_label: SkinToneSeasonLabel;
  undertone: SkinToneUndertone;
  skin_hex: string;
  palette_hex_list: string[];
  lab_l: number;
  lab_a: number;
  lab_b: number;
}

export interface ManualSkinTonePayload {
  input_method: "manual";
  skin_hex: string;
  sample_area: SkinToneSampleArea;
  undertone: SkinToneUndertone;
  tone_label?: SkinToneSeasonLabel | "";
}

export interface CameraSkinTonePayload {
  input_method: "camera";
  image_base64: string;
  sample_area: SkinToneSampleArea;
}

export type AnalyzeSkinTonePayload =
  | ManualSkinTonePayload
  | CameraSkinTonePayload;

export type SaveSkinTonePayload = SkinToneAnalysis;

export type SkinToneMetadataResponse = ApiResponse<SkinToneMetadata>;
export type SkinToneAnalyzeResponse = ApiResponse<SkinToneAnalysis>;
export type SkinToneSaveResponse = ApiResponse<{ profile_completed: boolean }>;
export type SkinToneResponse = ApiResponse<SkinToneAnalysis>;
