import { useLogout } from "~/hooks/useAuth";
import { SkinToneForm } from "~/components/forms/SkinToneForm";

export default function OnboardingPage() {
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1c1b1b]">
      <SkinToneForm />
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="fixed right-4 top-4 z-20 bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] shadow-sm backdrop-blur transition-colors hover:text-[#1c1b1b] disabled:opacity-50"
      >
        {logout.isPending ? "Keluar..." : "Logout"}
      </button>
    </div>
  );
}
