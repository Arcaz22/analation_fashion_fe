import { type FormEvent, useMemo, useState } from "react";

import { CameraCapture } from "~/components/shared/CameraCapture";
import {
  useAnalyzeBodyShape,
  useBodyShapeMetadata,
  useSaveBodyShape,
} from "~/hooks/useBodyShape";
import type {
  BodyShapeAnalysis,
  BodyShapeGender,
  BodyShapeLabel,
} from "~/types/bodyShape";

const fallbackMetadata = {
  genders: ["female", "male"] as BodyShapeGender[],
  shapes: {
    female: [
      "Hourglass",
      "Pear",
      "Apple",
      "Rectangle",
      "Inverted Triangle",
    ] as BodyShapeLabel[],
    male: [
      "Trapezoid",
      "Rectangle",
      "Inverted Triangle",
      "Triangle",
      "Oval",
    ] as BodyShapeLabel[],
  },
};

const genderLabels: Record<BodyShapeGender, string> = {
  female: "Perempuan",
  male: "Laki-laki",
};

const shapeProfiles: Record<
  string,
  Pick<
    BodyShapeAnalysis,
    | "description"
    | "recommended_styles"
    | "shoulder_width"
    | "waist_width"
    | "hip_width"
    | "shoulder_to_hip_ratio"
    | "waist_to_shoulder_ratio"
    | "waist_to_hip_ratio"
  > & { shortDescription: string; guide: string[] }
> = {
  "female:Hourglass": {
    shortDescription: "Bahu dan pinggul seimbang, pinggang terdefinisi.",
    description:
      "Bahu dan pinggul cenderung seimbang dengan pinggang yang lebih ramping dan terlihat jelas.",
    recommended_styles: ["Wrap dress", "Belted waist", "Fitted tops"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1,
    waist_to_shoulder_ratio: 0.75,
    waist_to_hip_ratio: 0.7,
    guide: [
      "Pilih potongan yang mengikuti pinggang.",
      "Gunakan belt atau detail seam di area pinggang.",
      "Hindari siluet boxy yang menutup proporsi alami.",
    ],
  },
  "female:Pear": {
    shortDescription: "Pinggul lebih lebar dari bahu.",
    description:
      "Pinggul lebih dominan daripada bahu, biasanya dengan pinggang yang tetap mudah terlihat.",
    recommended_styles: ["Statement tops", "A-line skirts", "Structured shoulders"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 0.9,
    waist_to_shoulder_ratio: 0.75,
    waist_to_hip_ratio: 0.75,
    guide: [
      "Arahkan detail visual ke area bahu dan dada.",
      "Pilih bawahan yang jatuh rapi dari pinggul.",
      "Gunakan warna lebih gelap untuk bawahan bila ingin efek seimbang.",
    ],
  },
  "female:Apple": {
    shortDescription: "Area tengah tubuh lebih dominan.",
    description:
      "Proporsi paling menonjol ada di area perut atau torso, dengan kaki yang sering terlihat lebih ramping.",
    recommended_styles: ["V-neck tops", "Empire waist", "Straight-leg pants"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1,
    waist_to_shoulder_ratio: 0.9,
    waist_to_hip_ratio: 0.9,
    guide: [
      "Pilih garis vertikal dan neckline terbuka.",
      "Cari potongan yang jatuh dari dada tanpa menempel di perut.",
      "Hindari detail tebal tepat di area pinggang.",
    ],
  },
  "female:Rectangle": {
    shortDescription: "Bahu, pinggang, dan pinggul relatif lurus.",
    description:
      "Lebar bahu, pinggang, dan pinggul relatif mirip sehingga tubuh terlihat lebih lurus.",
    recommended_styles: ["Peplum tops", "Layering", "High-waisted bottoms"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1,
    waist_to_shoulder_ratio: 0.85,
    waist_to_hip_ratio: 0.85,
    guide: [
      "Buat ilusi pinggang dengan layering atau belt.",
      "Pilih detail volume di atas atau bawah tubuh.",
      "Hindari potongan lurus penuh bila ingin bentuk lebih terdefinisi.",
    ],
  },
  "female:Inverted Triangle": {
    shortDescription: "Bahu lebih lebar dari pinggul.",
    description:
      "Bahu lebih dominan daripada pinggul, sehingga styling idealnya memberi volume visual ke tubuh bawah.",
    recommended_styles: ["Wide-leg pants", "A-line skirts", "Simple necklines"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1.15,
    waist_to_shoulder_ratio: 0.8,
    waist_to_hip_ratio: 0.9,
    guide: [
      "Tambahkan volume pada area pinggul atau kaki.",
      "Pilih atasan bersih tanpa banyak detail bahu.",
      "Gunakan bawahan bertekstur atau potongan melebar.",
    ],
  },
  "male:Trapezoid": {
    shortDescription: "Bahu sedikit lebih lebar dari pinggul.",
    description:
      "Bahu sedikit lebih lebar daripada pinggul dengan proporsi torso yang seimbang.",
    recommended_styles: ["Slim fit", "Structured jackets", "Clean layering"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1.1,
    waist_to_shoulder_ratio: 0.78,
    waist_to_hip_ratio: 0.86,
    guide: [
      "Pertahankan proporsi dengan potongan rapi.",
      "Gunakan outer terstruktur untuk memperjelas garis bahu.",
      "Hindari ukuran terlalu longgar yang membuat torso terlihat kotak.",
    ],
  },
  "male:Rectangle": {
    shortDescription: "Bahu dan pinggul hampir sejajar.",
    description:
      "Bahu, pinggang, dan pinggul relatif sejajar sehingga siluet tubuh terlihat lurus.",
    recommended_styles: ["Layered tops", "Structured shoulders", "Tapered pants"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1,
    waist_to_shoulder_ratio: 0.9,
    waist_to_hip_ratio: 0.9,
    guide: [
      "Bangun bentuk V dengan layering bagian atas.",
      "Pilih jaket atau overshirt dengan bahu rapi.",
      "Gunakan celana tapered agar proporsi bawah tetap bersih.",
    ],
  },
  "male:Inverted Triangle": {
    shortDescription: "Bahu jauh lebih lebar dari pinggul.",
    description:
      "Tubuh atas sangat dominan dibanding pinggul, biasanya membentuk siluet V yang kuat.",
    recommended_styles: ["Straight pants", "Minimal tops", "Balanced layers"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1.2,
    waist_to_shoulder_ratio: 0.72,
    waist_to_hip_ratio: 0.86,
    guide: [
      "Jaga atasan tetap minimal agar bahu tidak berlebihan.",
      "Pilih bawahan straight untuk menyeimbangkan tubuh bawah.",
      "Hindari skinny pants yang memperbesar kontras proporsi.",
    ],
  },
  "male:Triangle": {
    shortDescription: "Pinggang atau pinggul lebih lebar dari bahu.",
    description:
      "Area pinggang atau pinggul lebih dominan daripada bahu, sehingga styling perlu membangun struktur tubuh atas.",
    recommended_styles: ["Structured jackets", "Dark tops", "Straight pants"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 0.9,
    waist_to_shoulder_ratio: 1,
    waist_to_hip_ratio: 0.95,
    guide: [
      "Tambahkan struktur di bahu lewat jaket atau overshirt.",
      "Pilih atasan warna solid dengan fit yang tidak ketat.",
      "Hindari detail besar di area perut.",
    ],
  },
  "male:Oval": {
    shortDescription: "Area torso tengah lebih penuh.",
    description:
      "Torso tengah lebih dominan, dengan bahu dan kaki yang bisa terlihat lebih sempit.",
    recommended_styles: ["Vertical lines", "Open jackets", "Straight-leg pants"],
    shoulder_width: 0,
    waist_width: 0,
    hip_width: 0,
    shoulder_to_hip_ratio: 1,
    waist_to_shoulder_ratio: 1.05,
    waist_to_hip_ratio: 1,
    guide: [
      "Gunakan garis vertikal dan layer terbuka.",
      "Pilih bahan yang jatuh rapi tanpa menempel.",
      "Hindari atasan terlalu pendek atau terlalu ketat.",
    ],
  },
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Permintaan gagal diproses.";
}

function getShapeProfile(gender: BodyShapeGender, shape: BodyShapeLabel) {
  return shapeProfiles[`${gender}:${shape}`] ?? shapeProfiles["female:Hourglass"];
}

function buildManualAnalysis(
  gender: BodyShapeGender,
  shapeLabel: BodyShapeLabel
): BodyShapeAnalysis {
  const profile = getShapeProfile(gender, shapeLabel);

  return {
    input_method: "manual",
    gender,
    shape_label: shapeLabel,
    description: profile.description,
    recommended_styles: profile.recommended_styles,
    shoulder_width: profile.shoulder_width,
    waist_width: profile.waist_width,
    hip_width: profile.hip_width,
    shoulder_to_hip_ratio: profile.shoulder_to_hip_ratio,
    waist_to_shoulder_ratio: profile.waist_to_shoulder_ratio,
    waist_to_hip_ratio: profile.waist_to_hip_ratio,
  };
}

export function BodyShapeForm({
  onBack,
  onComplete,
}: {
  onBack?: () => void;
  onComplete?: () => void;
}) {
  const metadata = useBodyShapeMetadata();
  const analyzeBodyShape = useAnalyzeBodyShape();
  const saveBodyShape = useSaveBodyShape();

  const options = metadata.data?.data ?? fallbackMetadata;
  const [mode, setMode] = useState<"manual" | "camera">("manual");
  const [gender, setGender] = useState<BodyShapeGender>("female");
  const [shapeLabel, setShapeLabel] = useState<BodyShapeLabel>("Hourglass");
  const [analysis, setAnalysis] = useState<BodyShapeAnalysis | null>(null);
  const [localError, setLocalError] = useState("");
  const [saved, setSaved] = useState(false);

  const shapes = useMemo(
    () => options.shapes[gender] ?? fallbackMetadata.shapes[gender],
    [gender, options.shapes]
  );

  const activeProfile = getShapeProfile(gender, shapeLabel);
  const preview = analysis ?? buildManualAnalysis(gender, shapeLabel);
  const busy = analyzeBodyShape.isPending || saveBodyShape.isPending;
  const error =
    localError ||
    (analyzeBodyShape.error ? getErrorMessage(analyzeBodyShape.error) : "") ||
    (saveBodyShape.error ? getErrorMessage(saveBodyShape.error) : "");

  function selectGender(nextGender: BodyShapeGender) {
    const nextShape = options.shapes[nextGender]?.[0] ?? fallbackMetadata.shapes[nextGender][0];
    setGender(nextGender);
    setShapeLabel(nextShape);
    setAnalysis(null);
    setSaved(false);
  }

  function selectShape(nextShape: BodyShapeLabel) {
    setShapeLabel(nextShape);
    setAnalysis(null);
    setSaved(false);
  }

  async function analyzeManual() {
    const fallbackAnalysis = buildManualAnalysis(gender, shapeLabel);
    setLocalError("");

    const response = await analyzeBodyShape.mutateAsync({
      input_method: "manual",
      gender,
      shape_label: shapeLabel,
      shoulder_to_hip_ratio: fallbackAnalysis.shoulder_to_hip_ratio,
      waist_to_shoulder_ratio: fallbackAnalysis.waist_to_shoulder_ratio,
      waist_to_hip_ratio: fallbackAnalysis.waist_to_hip_ratio,
    });

    setAnalysis(response.data);
    setSaved(false);
    return response.data;
  }

  async function analyzeCameraImage(imageBase64: string) {
    setLocalError("");
    const response = await analyzeBodyShape.mutateAsync({
      input_method: "camera",
      gender,
      image_base64: imageBase64,
    });

    setAnalysis(response.data);
    setShapeLabel(response.data.shape_label);
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const result = analysis ?? (await analyzeManual());
    if (!result) return;

    await saveBodyShape.mutateAsync(result);
    setSaved(true);
    onComplete?.();
  }

  return (
    <form className="min-h-screen pb-28" onSubmit={handleSubmit}>
      <header className="sticky top-0 z-10 border-b border-[#E8E8E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#747878]">
              Step 02 / 02
            </p>
            <h1 className="text-lg font-semibold uppercase text-[#1c1b1b]">
              Bentuk Tubuh
            </h1>
          </div>
          <button
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] underline-offset-4 hover:text-[#1c1b1b] hover:underline"
            type="button"
            onClick={onBack}
          >
            Kembali
          </button>
        </div>
        <div className="h-1 bg-[#E8E8E4]">
          <div className="h-full w-full bg-[#1c1b1b]" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <section className="mb-9">
          <h2 className="mb-3 max-w-xl text-3xl font-semibold leading-tight text-[#1c1b1b]">
            Tentukan bentuk tubuh Anda.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-[#747878]">
            Pilih proporsi yang paling mendekati agar rekomendasi outfit lebih sesuai dengan siluet Anda.
          </p>
        </section>

        <div className="mb-8 grid grid-cols-2 bg-[#F1EDEC] p-1">
          <button
            className={`h-12 text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
              mode === "manual"
                ? "bg-white text-[#1c1b1b] shadow-sm"
                : "text-[#747878] hover:bg-white/60"
            }`}
            type="button"
            onClick={() => setMode("manual")}
          >
            Manual
          </button>
          <button
            className={`h-12 text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
              mode === "camera"
                ? "bg-white text-[#1c1b1b] shadow-sm"
                : "text-[#747878] hover:bg-white/60"
            }`}
            type="button"
            onClick={() => setMode("camera")}
          >
            Kamera
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 bg-white p-1 ring-1 ring-[#E8E8E4]">
          {options.genders.map((option) => (
            <button
              className={`h-11 text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
                gender === option
                  ? "bg-[#1c1b1b] text-white"
                  : "text-[#747878] hover:bg-[#FAFAF8]"
              }`}
              key={option}
              type="button"
              onClick={() => selectGender(option)}
            >
              {genderLabels[option]}
            </button>
          ))}
        </div>

        {mode === "manual" ? (
          <section>
            <div className="grid gap-3 sm:grid-cols-2">
              {shapes.map((shape) => {
                const selected = shapeLabel === shape;
                const profile = getShapeProfile(gender, shape);

                return (
                  <button
                    className={`min-h-28 border bg-white p-4 text-left transition-colors ${
                      selected
                        ? "border-[#1c1b1b] ring-1 ring-[#1c1b1b]"
                        : "border-[#E8E8E4] hover:border-[#C4C7C7]"
                    }`}
                    key={`${gender}-${shape}`}
                    type="button"
                    onClick={() => selectShape(shape)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <ShapeMark gender={gender} shape={shape} selected={selected} />
                      <span
                        className={`mt-1 size-3 border ${
                          selected
                            ? "border-[#1c1b1b] bg-[#1c1b1b]"
                            : "border-[#C4C7C7] bg-white"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-[#1c1b1b]">
                      {shape}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#747878]">
                      {profile.shortDescription}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              className="mt-5 h-12 w-full border border-[#1c1b1b] bg-white text-sm font-semibold uppercase tracking-[0.1em] text-[#1c1b1b] transition-colors hover:bg-[#1c1b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              type="button"
              onClick={() => void analyzeManual()}
            >
              {analyzeBodyShape.isPending ? "Menganalisis..." : "Analisis bentuk"}
            </button>
          </section>
        ) : (
          <CameraCapture
            busy={busy}
            captureLabel="Capture"
            className="max-w-sm"
            helperText="Ambil foto badan penuh dengan pencahayaan merata. Pastikan bahu, pinggang, dan pinggul terlihat jelas."
            overlayLabel="Posisikan badan"
            placeholderLabel="Kamera belum aktif"
            onCapture={analyzeCameraImage}
            onError={setLocalError}
          />
        )}

        <section className="mt-8 border border-[#E8E8E4] bg-white p-5">
          <div className="mb-5 flex items-start gap-4">
            <ShapeMark
              gender={preview.gender}
              shape={preview.shape_label}
              selected
              size="large"
            />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                Preview hasil
              </p>
              <h3 className="text-xl font-semibold text-[#1c1b1b]">
                {preview.shape_label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#747878]">
                {preview.description}
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {preview.recommended_styles.map((style) => (
              <span
                className="border border-[#E8E8E4] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#1c1b1b]"
                key={style}
              >
                {style}
              </span>
            ))}
          </div>

          <div className="space-y-4 border-t border-[#E8E8E4] pt-5">
            <RatioBar
              label="Shoulder to hip"
              value={preview.shoulder_to_hip_ratio}
            />
            <RatioBar
              label="Waist to shoulder"
              value={preview.waist_to_shoulder_ratio}
            />
            <RatioBar label="Waist to hip" value={preview.waist_to_hip_ratio} />
          </div>

          <details className="mt-5 border-t border-[#E8E8E4] pt-5">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:text-[#1c1b1b]">
              Lihat panduan proporsi
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#747878]">
              {activeProfile.guide.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        </section>

        {error ? <p className="mt-5 text-sm text-[#ba1a1a]">{error}</p> : null}
        {saved ? (
          <p className="mt-5 text-sm font-medium text-[#28724f]">
            Body shape berhasil disimpan.
          </p>
        ) : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[#E8E8E4] bg-white">
        <div
          className={`mx-auto px-6 py-5 ${
            mode === "camera" ? "max-w-[432px]" : "max-w-2xl"
          }`}
        >
          <button
            className="h-12 w-full bg-[#1c1b1b] text-sm font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {saveBodyShape.isPending ? "Menyimpan..." : "Simpan body shape"}
          </button>
        </div>
      </footer>
    </form>
  );
}

function RatioBar({ label, value }: { label: string; value: number }) {
  const width = `${Math.min(Math.max(value, 0.55), 1.25) * 70}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#747878]">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold text-[#1c1b1b]">
          {value.toFixed(2)}
        </p>
      </div>
      <div className="h-2 bg-[#F1EDEC]">
        <div className="h-full bg-[#1c1b1b]" style={{ width }} />
      </div>
    </div>
  );
}

function ShapeMark({
  gender,
  shape,
  selected,
  size = "small",
}: {
  gender: BodyShapeGender;
  shape: BodyShapeLabel;
  selected: boolean;
  size?: "small" | "large";
}) {
  const boxClass = size === "large" ? "h-20 w-14" : "h-12 w-9";
  const stroke = selected ? "#1c1b1b" : "#747878";
  const fill = selected ? "#F1EDEC" : "#FAFAF8";
  const path = getShapePath(gender, shape);

  return (
    <div
      className={`grid shrink-0 place-items-center bg-[#FAFAF8] ${boxClass}`}
      aria-hidden="true"
    >
      <svg className="h-full w-full" viewBox="0 0 48 72" role="img">
        <path d={path} fill={fill} stroke={stroke} strokeWidth="2" />
      </svg>
    </div>
  );
}

function getShapePath(gender: BodyShapeGender, shape: BodyShapeLabel) {
  if (gender === "male") {
    if (shape === "Trapezoid") return "M16 8 L32 8 L36 64 L12 64 Z";
    if (shape === "Inverted Triangle") return "M10 8 L38 8 L31 64 L17 64 Z";
    if (shape === "Triangle") return "M18 8 L30 8 L38 64 L10 64 Z";
    if (shape === "Oval")
      return "M16 9 Q24 5 32 9 Q40 30 34 63 L14 63 Q8 30 16 9 Z";
    return "M15 8 L33 8 L33 64 L15 64 Z";
  }

  if (shape === "Hourglass")
    return "M13 8 Q24 4 35 8 L31 27 Q24 35 17 27 Z M17 27 Q24 35 31 27 L36 63 Q24 68 12 63 Z";
  if (shape === "Pear")
    return "M17 8 Q24 5 31 8 L29 28 L19 28 Z M19 28 L29 28 L38 63 Q24 68 10 63 Z";
  if (shape === "Apple")
    return "M15 10 Q24 3 33 10 Q42 34 34 63 L14 63 Q6 34 15 10 Z";
  if (shape === "Inverted Triangle")
    return "M9 8 L39 8 L31 44 Q24 52 17 44 Z M17 44 Q24 52 31 44 L28 64 L20 64 Z";
  return "M15 8 L33 8 L33 64 L15 64 Z";
}
