import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { skinToneApi } from "~/api/skinTone";
import { getApiErrorMessage } from "~/lib/apiError";
import { showToast } from "~/stores/toastStore";
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
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Analisis skin tone selesai",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Analisis skin tone gagal",
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useSaveSkinTone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveSkinTonePayload) => skinToneApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skinToneKeys.detail() });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showToast({
        type: "success",
        title: "Skin tone tersimpan",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Skin tone gagal disimpan",
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useSkinTone() {
  return useQuery({
    queryKey: skinToneKeys.detail(),
    queryFn: skinToneApi.get,
  });
}
