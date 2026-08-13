import { AxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Permintaan gagal diproses."
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?: { detail?: string }[];
        }
      | undefined;

    return data?.errors?.[0]?.detail || data?.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
