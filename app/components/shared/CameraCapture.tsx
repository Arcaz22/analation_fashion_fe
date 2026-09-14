import { type ChangeEvent, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  busy?: boolean;
  captureLabel?: string;
  idleLabel?: string;
  loadingLabel?: string;
  overlayLabel?: string;
  placeholderLabel?: string;
  uploadLabel?: string;
  helperText?: string;
  className?: string;
  unmirrorFrontCamera?: boolean;
  onCapture: (imageBase64: string) => Promise<void> | void;
  onError?: (message: string) => void;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export function CameraCapture({
  busy = false,
  captureLabel = "Capture",
  idleLabel = "Buka kamera",
  loadingLabel = "Menganalisis...",
  overlayLabel = "Posisikan wajah",
  placeholderLabel = "Kamera belum aktif",
  uploadLabel = "Upload foto",
  helperText,
  className = "",
  unmirrorFrontCamera = true,
  onCapture,
  onError,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  function reportError(message: string) {
    onError?.(message);
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      reportError("Browser ini tidak mendukung akses kamera langsung. Gunakan upload foto.");
      return;
    }

    try {
      reportError("");
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 960 },
          aspectRatio: { ideal: 4 / 3 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPreviewImage("");
      setCameraActive(true);
    } catch {
      reportError("Kamera tidak bisa dibuka. Periksa izin kamera atau gunakan upload foto.");
    }
  }

  async function captureCurrentFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraActive) {
      await startCamera();
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      reportError("Browser gagal mengambil gambar kamera.");
      return;
    }

    if (unmirrorFrontCamera) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewImage(imageBase64);
    stopCamera();
    await onCapture(imageBase64);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    reportError("");
    stopCamera();

    const imageBase64 = await fileToDataUrl(file);
    setPreviewImage(imageBase64);
    await onCapture(imageBase64);
  }

  return (
    <section className={`mx-auto w-full max-w-sm space-y-5 ${className}`}>
      <div className="relative grid aspect-[4/5] w-full place-items-center overflow-hidden bg-[#202020] text-white sm:aspect-[3/4]">
        <div className="absolute inset-0 grid place-items-center">
          {previewImage ? (
            <img
              alt="Preview kamera"
              className="h-full w-full object-contain"
              src={previewImage}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                aria-label="Preview kamera"
                autoPlay
                className={`h-full w-full object-contain ${
                  cameraActive ? "opacity-100" : "opacity-0"
                } ${unmirrorFrontCamera ? "[transform:scaleX(-1)]" : "[transform:scaleX(1)]"}`}
                muted
                playsInline
              />
              <div
                className={`absolute inset-0 grid place-items-center text-center transition-opacity ${
                  cameraActive ? "opacity-0" : "opacity-100"
                }`}
              >
                <div>
                  <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full border border-white/20 text-4xl">
                    ◌
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                    {placeholderLabel}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pointer-events-none absolute inset-5 grid place-items-center sm:inset-8">
          <div className="relative h-full w-full border border-white/65">
            <div className="absolute left-0 top-1/2 h-px w-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              {overlayLabel}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={(event) => void handleUpload(event)}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          className="h-12 w-full bg-[#1c1b1b] text-sm font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
          type="button"
          onClick={() => void (cameraActive ? captureCurrentFrame() : startCamera())}
        >
          {busy ? loadingLabel : cameraActive ? captureLabel : idleLabel}
        </button>
        <button
          className="h-11 w-full border border-[#1c1b1b] bg-white text-sm font-semibold uppercase tracking-[0.1em] text-[#1c1b1b] transition-colors hover:bg-[#1c1b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadLabel}
        </button>
      </div>

      {helperText ? (
        <p className="px-3 text-center text-xs leading-relaxed text-[#747878]">
          {helperText}
        </p>
      ) : null}
    </section>
  );
}
