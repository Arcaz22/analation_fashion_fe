import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

import { useToastStore, type ToastType } from "~/stores/toastStore";

const toastStyles: Record<ToastType, string> = {
  error: "border-[#f0c8c8] bg-[#fff7f7] text-[#ba1a1a]",
  info: "border-[#E8E8E4] bg-white text-[#1c1b1b]",
  success: "border-[#d8e8d8] bg-[#f7fff7] text-[#2f6f3e]",
};

const icons = {
  error: FiAlertCircle,
  info: FiInfo,
  success: FiCheckCircle,
};

export function ToastViewport() {
  const messages = useToastStore((state) => state.messages);
  const removeToast = useToastStore((state) => state.removeToast);

  if (!messages.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:right-6 md:top-6">
      {messages.map((message) => {
        const Icon = icons[message.type];

        return (
          <section
            className={`flex items-start gap-3 border p-4 shadow-lg backdrop-blur ${toastStyles[message.type]}`}
            key={message.id}
            role={message.type === "error" ? "alert" : "status"}
          >
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{message.title}</p>
              {message.description ? (
                <p className="mt-1 text-xs leading-relaxed text-[#747878]">
                  {message.description}
                </p>
              ) : null}
            </div>
            <button
              aria-label="Tutup notifikasi"
              className="grid size-6 shrink-0 place-items-center text-current opacity-70 transition-opacity hover:opacity-100"
              type="button"
              onClick={() => removeToast(message.id)}
            >
              <FiX aria-hidden="true" />
            </button>
          </section>
        );
      })}
    </div>
  );
}
