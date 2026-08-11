import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bodyShapeApi } from "~/api/bodyShape";
import { useAuthStore } from "~/stores/authStore";
import type {
  AnalyzeBodyShapePayload,
  SaveBodyShapePayload,
} from "~/types/bodyShape";

export const bodyShapeKeys = {
  all: ["body-shape"] as const,
  metadata: () => [...bodyShapeKeys.all, "metadata"] as const,
  detail: () => [...bodyShapeKeys.all, "detail"] as const,
};

export function useBodyShapeMetadata() {
  return useQuery({
    queryKey: bodyShapeKeys.metadata(),
    queryFn: bodyShapeApi.metadata,
  });
}

export function useAnalyzeBodyShape() {
  return useMutation({
    mutationFn: (payload: AnalyzeBodyShapePayload) =>
      bodyShapeApi.analyze(payload),
  });
}

export function useSaveBodyShape() {
  const queryClient = useQueryClient();
  const setProfileCompleted = useAuthStore((state) => state.setProfileCompleted);

  return useMutation({
    mutationFn: (payload: SaveBodyShapePayload) => bodyShapeApi.save(payload),
    onSuccess: (response) => {
      setProfileCompleted(response.data.profile_completed);
      queryClient.invalidateQueries({ queryKey: bodyShapeKeys.detail() });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useBodyShape() {
  return useQuery({
    queryKey: bodyShapeKeys.detail(),
    queryFn: bodyShapeApi.get,
  });
}
