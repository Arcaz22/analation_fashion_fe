import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { skinToneApi } from "~/api/skinTone";
import type { AnalyzeSkinTonePayload, SaveSkinTonePayload } from "~/types/skinTone";

export const skinToneKeys = {
  all: ["skin-tone"] as const,
  metadata: () => [...skinToneKeys.all, "metadata"] as const,
  detail: () => [...skinToneKeys.all, "detail"] as const,
};

export function useSkinToneMetadata() {
  return useQuery({
    queryKey: skinToneKeys.metadata(),
    queryFn: skinToneApi.metadata,
  });
}

export function useAnalyzeSkinTone() {
  return useMutation({
    mutationFn: (payload: AnalyzeSkinTonePayload) => skinToneApi.analyze(payload),
  });
}

export function useSaveSkinTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveSkinTonePayload) => skinToneApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skinToneKeys.detail() });
    },
  });
}

export function useSkinTone() {
  return useQuery({
    queryKey: skinToneKeys.detail(),
    queryFn: skinToneApi.get,
  });
}
