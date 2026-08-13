import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { outfitApi } from "~/api/outfit";
import { getApiErrorMessage } from "~/lib/apiError";
import { showToast } from "~/stores/toastStore";
import type { CreateOutfitRecommendationPayload } from "~/types/outfit";

export const outfitKeys = {
  all: ["outfit-recommendations"] as const,
  history: (limit: number) => [...outfitKeys.all, "history", limit] as const,
  historyItem: (historyId: string) =>
    [...outfitKeys.all, "history", "item", historyId] as const,
};

export function useCreateOutfitRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOutfitRecommendationPayload) =>
      outfitApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outfitKeys.all });
      queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
      showToast({
        type: "success",
        title: "Rekomendasi dibuat",
        description: "Outfit baru sudah tersimpan ke history.",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Rekomendasi gagal dibuat",
        description: getApiErrorMessage(
          error,
          "Pastikan profil dan match sudah lengkap."
        ),
      });
    },
  });
}

export function useOutfitHistory(limit = 20) {
  return useQuery({
    queryKey: outfitKeys.history(limit),
    queryFn: () => outfitApi.history(limit),
  });
}

export function useOutfitHistoryItem(historyId: string | undefined) {
  return useQuery({
    queryKey: outfitKeys.historyItem(historyId ?? ""),
    queryFn: () => outfitApi.historyItem(historyId!),
    enabled: Boolean(historyId),
  });
}
