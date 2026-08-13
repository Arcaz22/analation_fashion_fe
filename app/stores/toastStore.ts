import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastState {
  messages: ToastMessage[];
  removeToast: (id: string) => void;
  toast: (message: Omit<ToastMessage, "id">) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  messages: [],
  removeToast: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
  toast: (message) => {
    const id = crypto.randomUUID();

    set((state) => ({
      messages: [...state.messages, { ...message, id }].slice(-4),
    }));

    window.setTimeout(() => {
      get().removeToast(id);
    }, 4200);
  },
}));

export function showToast(message: Omit<ToastMessage, "id">) {
  useToastStore.getState().toast(message);
}
