import { type FormEvent, useMemo, useState } from "react";

import { CameraCapture } from "~/components/shared/CameraCapture";
import { useAnalyzeSkinTone, useSaveSkinTone, useSkinToneMetadata } from "~/hooks/useSkinTone";
import type {
  SkinToneAnalysis,
  SkinToneSampleArea,
  SkinToneSeasonLabel,
  SkinToneUndertone,
} from "~/types/skinTone";

const fallbackMetadata = {
  sample_areas: ["face", "neck", "inner_arm", "body"] as SkinToneSampleArea[],
  undertones: ["Warm", "Cool", "Neutral"] as SkinToneUndertone[],
  season_labels: ["Spring", "Summer", "Autumn", "Winter"] as SkinToneSeasonLabel[],
};

const sampleAreaLabels: Record<SkinToneSampleArea, string> = {
  face: "Wajah",
  neck: "Leher",
  inner_arm: "Lengan Dalam",
  body: "Badan",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Permintaan gagal diproses.";
}

function isValidHex(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function SkinToneForm({ onSaved }: { onSaved?: () => void }) {
  const metadata = useSkinToneMetadata();
  const analyzeSkinTone = useAnalyzeSkinTone();
  const saveSkinTone = useSaveSkinTone();

  const options = metadata.data?.data ?? fallbackMetadata;
  const [mode, setMode] = useState<"manual" | "camera">("manual");
  const [skinHex, setSkinHex] = useState("#9E867E");
  const [sampleArea, setSampleArea] = useState<SkinToneSampleArea>("neck");
  const [undertone, setUndertone] = useState<SkinToneUndertone>("Cool");
  const [toneLabel, setToneLabel] = useState<SkinToneSeasonLabel | "">("Autumn");
  const [analysis, setAnalysis] = useState<SkinToneAnalysis | null>(null);
  const [localError, setLocalError] = useState("");
  const [saved, setSaved] = useState(false);

  const palette = useMemo(
    () => analysis?.palette_hex_list ?? ["#D9C1B6", "#B99183", "#8F6A60", "#6A4A43"],
    [analysis]
  );

  function applyAnalysis(result: SkinToneAnalysis) {
    setAnalysis(result);
    setSkinHex(result.skin_hex);
    setSampleArea(result.sample_area);
    setUndertone(result.undertone);
    setToneLabel(result.tone_label);
    setSaved(false);
  }

  async function analyzeManual() {
    const normalizedHex = normalizeHex(skinHex).toUpperCase();

    if (!isValidHex(normalizedHex)) {
      setLocalError("Gunakan format HEX yang valid, contoh #9E867E.");
      return null;
    }

    setLocalError("");
    setSkinHex(normalizedHex);

    const response = await analyzeSkinTone.mutateAsync({
      input_method: "manual",
      skin_hex: normalizedHex,
      sample_area: sampleArea,
      undertone,
      tone_label: toneLabel,
    });

    applyAnalysis(response.data);
    return response.data;
  }

  async function analyzeCameraImage(imageBase64: string) {
    setLocalError("");
    const response = await analyzeSkinTone.mutateAsync({
      input_method: "camera",
      image_base64: imageBase64,
      sample_area: "face",
    });

    applyAnalysis(response.data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const result = analysis ?? (await analyzeManual());
    if (!result) return;

    await saveSkinTone.mutateAsync(result);
    setSaved(true);
    onSaved?.();
  }

  const busy = analyzeSkinTone.isPending || saveSkinTone.isPending;
  const error =
    localError ||
    (analyzeSkinTone.error ? getErrorMessage(analyzeSkinTone.error) : "") ||
    (saveSkinTone.error ? getErrorMessage(saveSkinTone.error) : "");

  return (
    <form className="min-h-screen pb-28" onSubmit={handleSubmit}>
      <header className="sticky top-0 z-10 border-b border-[#E8E8E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#747878]">
              Step 01 / 02
            </p>
            <h1 className="text-lg font-semibold uppercase text-[#1c1b1b]">
              Warna Kulit
            </h1>
          </div>
          <button
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] underline-offset-4 hover:text-[#1c1b1b] hover:underline"
            type="button"
            onClick={() => {
              setSkinHex("#9E867E");
              setSampleArea("neck");
              setUndertone("Cool");
              setToneLabel("Autumn");
              setAnalysis(null);
              setLocalError("");
            }}
          >
            Reset
          </button>
        </div>
        <div className="h-1 bg-[#E8E8E4]">
          <div className="h-full w-1/2 bg-[#1c1b1b]" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <section className="mb-9">
          <h2 className="mb-3 max-w-xl text-3xl font-semibold leading-tight text-[#1c1b1b]">
            Tentukan warna kulit Anda.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-[#747878]">
            Data ini membantu MATCH memilih palet warna outfit yang lebih akurat untuk profil Anda.
          </p>
        </section>

        <div className="mb-8 grid grid-cols-2 bg-[#F1EDEC] p-1">
          <button
            className={`h-12 text-sm font-semibold uppercase tracking-widest transition-colors ${
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
            className={`h-12 text-sm font-semibold uppercase tracking-widest transition-colors ${
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

        {mode === "manual" ? (
          <section className="space-y-6">
            <div className="flex items-center gap-5 border border-[#E8E8E4] bg-white p-5">
              <label
                className="grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-[#C4C7C7]"
                style={{ backgroundColor: isValidHex(skinHex) ? skinHex : "#9E867E" }}
                title="Pilih warna kulit"
              >
                <span className="sr-only">Pilih warna kulit</span>
                <input
                  className="size-20 cursor-pointer opacity-0"
                  type="color"
                  value={isValidHex(skinHex) ? skinHex : "#9E867E"}
                  onChange={(event) => {
                    setSkinHex(event.target.value.toUpperCase());
                    setAnalysis(null);
                    setSaved(false);
                  }}
                />
              </label>

              <div className="min-w-0 flex-1">
                <label
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-[#747878]"
                  htmlFor="skin-hex"
                >
                  Kode warna
                </label>
                <input
                  className="h-12 w-full border border-[#E8E8E4] bg-[#FAFAF8] px-4 font-mono text-base uppercase text-[#1c1b1b] outline-none transition-colors focus:border-[#1c1b1b]"
                  id="skin-hex"
                  maxLength={7}
                  value={skinHex}
                  onChange={(event) => {
                    setSkinHex(normalizeHex(event.target.value).toUpperCase());
                    setAnalysis(null);
                    setSaved(false);
                  }}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Area sampel"
                value={sampleArea}
                onChange={(value) => {
                  setSampleArea(value as SkinToneSampleArea);
                  setAnalysis(null);
                  setSaved(false);
                }}
                options={options.sample_areas.map((value) => ({
                  value,
                  label: sampleAreaLabels[value],
                }))}
              />
              <SelectField
                label="Undertone"
                value={undertone}
                onChange={(value) => {
                  setUndertone(value as SkinToneUndertone);
                  setAnalysis(null);
                  setSaved(false);
                }}
                options={options.undertones.map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </div>

            <SelectField
              label="Season label"
              value={toneLabel}
              onChange={(value) => {
                setToneLabel(value as SkinToneSeasonLabel | "");
                setAnalysis(null);
                setSaved(false);
              }}
              options={[
                { value: "", label: "Biarkan sistem mendeteksi" },
                ...options.season_labels.map((value) => ({ value, label: value })),
              ]}
            />

            <button
              className="h-12 w-full border border-[#1c1b1b] bg-white text-sm font-semibold uppercase tracking-widest text-[#1c1b1b] transition-colors hover:bg-[#1c1b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              type="button"
              onClick={() => void analyzeManual()}
            >
              {analyzeSkinTone.isPending ? "Menganalisis..." : "Analisis warna"}
            </button>
          </section>
        ) : (
          <CameraCapture
            busy={busy}
            className="max-w-sm"
            helperText="Gunakan pencahayaan alami dan hindari filter agar hasil analisis warna lebih konsisten."
            onCapture={analyzeCameraImage}
            onError={setLocalError}
          />
        )}

        {analysis ? (
          <section className="mt-8 border border-[#E8E8E4] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                  Hasil analisis
                </p>
                <h3 className="text-xl font-semibold text-[#1c1b1b]">
                  {analysis.tone_label} / {analysis.undertone}
                </h3>
              </div>
              <div
                className="size-12 rounded-full border border-[#C4C7C7]"
                style={{ backgroundColor: analysis.skin_hex }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {palette.map((color) => (
                <div
                  className="h-14 border border-black/5"
                  key={color}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </section>
        ) : null}

        {error ? <p className="mt-5 text-sm text-[#ba1a1a]">{error}</p> : null}
        {saved ? (
          <p className="mt-5 text-sm font-medium text-[#28724f]">
            Skin tone berhasil disimpan. Step bentuk tubuh bisa dilanjutkan setelah halamannya tersedia.
          </p>
        ) : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[#E8E8E4] bg-white">
        <div
          className={`mx-auto px-6 py-5 ${
            mode === "camera" ? "max-w-108" : "max-w-2xl"
          }`}
        >
          <button
            className="h-12 w-full bg-[#1c1b1b] text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {saveSkinTone.isPending ? "Menyimpan..." : "Simpan skin tone"}
          </button>
        </div>
      </footer>
    </form>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-[#747878]">
        {label}
      </span>
      <select
        className="h-12 w-full cursor-pointer border border-[#E8E8E4] bg-white px-4 text-sm text-[#1c1b1b] outline-none transition-colors focus:border-[#1c1b1b]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || "auto"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
