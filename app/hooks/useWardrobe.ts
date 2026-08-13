import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { wardrobeApi } from "~/api/wardrobe";
import { getApiErrorMessage } from "~/lib/apiError";
import { showToast } from "~/stores/toastStore";
import type {
  CreateWardrobeItemPayload,
  UpdateWardrobeItemPayload,
  WardrobeCategory,
} from "~/types/wardrobe";

export const wardrobeKeys = {
  all: ["wardrobe"] as const,
  metadata: () => [...wardrobeKeys.all, "metadata"] as const,
  items: (category?: WardrobeCategory) =>
    [...wardrobeKeys.all, "items", category ?? "all"] as const,
  item: (itemId: string) => [...wardrobeKeys.all, "item", itemId] as const,
};

export function useWardrobeMetadata() {
  return useQuery({
    queryKey: wardrobeKeys.metadata(),
    queryFn: wardrobeApi.metadata,
  });
}

export function useWardrobeItems(category?: WardrobeCategory) {
  return useQuery({
    queryKey: wardrobeKeys.items(category),
    queryFn: () => wardrobeApi.items(category),
  });
}

export function useWardrobeItem(itemId: string | undefined) {
  return useQuery({
    queryKey: wardrobeKeys.item(itemId ?? ""),
    queryFn: () => wardrobeApi.item(itemId!),
    enabled: Boolean(itemId),
  });
}

export function useCreateWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWardrobeItemPayload) =>
      wardrobeApi.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
      showToast({
        type: "success",
        title: "Item tersimpan",
        description: "Item baru sudah masuk ke koleksi.",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Item gagal disimpan",
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useAnalyzeWardrobeItem() {
  return useMutation({
    mutationFn: (image: File) => wardrobeApi.analyzeItem(image),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Foto berhasil dianalisis",
        description: "Detail item sudah diisi otomatis dan masih bisa diedit.",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Analisis foto gagal",
        description: getApiErrorMessage(
          error,
          "Isi detail item secara manual lalu simpan."
        ),
      });
    },
  });
}

export function useDeleteWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wardrobeApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
      showToast({
        type: "success",
        title: "Item dihapus",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Item gagal dihapus",
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useUpdateWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateWardrobeItemPayload;
    }) => wardrobeApi.updateItem(itemId, payload),
    onSuccess: (response, variables) => {
      if (response.data) {
        queryClient.setQueryData(wardrobeKeys.item(variables.itemId), response);
      }
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
      showToast({
        type: "success",
        title: "Item diperbarui",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Item gagal diperbarui",
        description: getApiErrorMessage(error),
      });
    },
  });
}
