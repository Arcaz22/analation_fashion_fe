import type { ApiResponse } from "~/types/auth";

export type BodyShapeInputMethod = "manual" | "camera";
export type BodyShapeGender = "female" | "male";
export type FemaleBodyShape =
  | "Hourglass"
  | "Pear"
  | "Apple"
  | "Rectangle"
  | "Inverted Triangle";
export type MaleBodyShape =
  | "Trapezoid"
  | "Rectangle"
  | "Inverted Triangle"
  | "Triangle"
  | "Oval";
export type BodyShapeLabel = FemaleBodyShape | MaleBodyShape;

export interface BodyShapeMetadata {
  genders: BodyShapeGender[];
  shapes: Record<BodyShapeGender, BodyShapeLabel[]>;
}

export interface BodyShapeAnalysis {
  input_method: BodyShapeInputMethod;
  gender: BodyShapeGender;
  shape_label: BodyShapeLabel;
  description: string;
  recommended_styles: string[];
  shoulder_to_hip_ratio: number;
  waist_to_shoulder_ratio: number;
  waist_to_hip_ratio: number;
}

export interface ManualBodyShapePayload {
  input_method: "manual";
  gender: BodyShapeGender;
  shape_label: BodyShapeLabel;
  shoulder_to_hip_ratio: number;
  waist_to_shoulder_ratio: number;
  waist_to_hip_ratio: number;
}

export interface CameraBodyShapePayload {
  input_method: "camera";
  gender: BodyShapeGender;
  image_base64: string;
}

export type AnalyzeBodyShapePayload =
  | ManualBodyShapePayload
  | CameraBodyShapePayload;

export type SaveBodyShapePayload = BodyShapeAnalysis;

export type BodyShapeMetadataResponse = ApiResponse<BodyShapeMetadata>;
export type BodyShapeAnalyzeResponse = ApiResponse<BodyShapeAnalysis>;
export type BodyShapeSaveResponse = ApiResponse<{ profile_completed: boolean }>;
export type BodyShapeResponse = ApiResponse<BodyShapeAnalysis>;
