import { useQuery } from "@tanstack/react-query";

import { profileApi } from "~/api/profile";

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
