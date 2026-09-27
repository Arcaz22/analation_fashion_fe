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
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pb-3 pt-6 md:px-8">
        <div>
          <p className="display-font text-2xl font-semibold tracking-[0.12em]">
            MATCH
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
            Personalisasi gaya Anda
          </p>
        </div>
        <p className="text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          Langkah {step === "skin-tone" ? "1" : "2"} dari 2
        </p>
      </header>
      <div className="mx-auto h-1 w-full max-w-3xl bg-[#E8E8E4]">
        <div
          className={'h-full bg-[#1c1b1b] transition-[width] duration-500 ' + (step === "skin-tone" ? "w-1/2" : "w-full")}
        />
      </div>
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
