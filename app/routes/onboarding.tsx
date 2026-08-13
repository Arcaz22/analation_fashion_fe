import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router";

import { useLogout } from "~/hooks/useAuth";
import { BodyShapeForm } from "~/components/forms/BodyShapeForm";
import { SkinToneForm } from "~/components/forms/SkinToneForm";

export default function OnboardingPage() {
  const logout = useLogout();
  const navigate = useNavigate();
  const [step, setStep] = useState<"skin-tone" | "body-shape">("skin-tone");

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1c1b1b]">
      {step === "skin-tone" ? (
        <SkinToneForm onSaved={() => setStep("body-shape")} />
      ) : (
        <BodyShapeForm
          onBack={() => setStep("skin-tone")}
          onComplete={() => navigate("/catalog")}
        />
      )}
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="fixed right-4 top-4 z-20 inline-flex items-center gap-2 bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] shadow-sm backdrop-blur transition-colors hover:text-[#1c1b1b] disabled:opacity-50"
      >
        {!logout.isPending ? <FiLogOut className="size-4" aria-hidden="true" /> : null}
        {logout.isPending ? "Keluar..." : "Logout"}
      </button>
    </div>
  );
}
