import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profileApi } from "~/api/profile";
import { getApiErrorMessage } from "~/lib/apiError";
import { showToast } from "~/stores/toastStore";
import type { UpdateUserProfilePayload } from "~/types/profile";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  stats: () => [...profileKeys.all, "stats"] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: profileApi.me,
  });
}

export function useUserProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: profileApi.stats,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) =>
      profileApi.update(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(profileKeys.me(), (current: unknown) => {
        if (
          current &&
          typeof current === "object" &&
          "data" in current &&
          current.data &&
          typeof current.data === "object"
        ) {
          return {
            ...current,
            data: {
              ...current.data,
              ...response.data,
            },
          };
        }

        return response;
      });
      showToast({
        type: "success",
        title: "Profil diperbarui",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Profil gagal diperbarui",
        description: getApiErrorMessage(error),
      });
    },
  });
}
