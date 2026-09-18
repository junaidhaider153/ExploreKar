"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  UploadCloud,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_BYTES = 16 * 1024 * 1024; // 16MB max raw input (will be compressed)

const SCAN_STEPS = [
  "Optimizing room photo…",
  "Calibrating wall planes & perspective…",
  "Extracting lighting cues & color palette…",
  "Harmonizing catalog furniture matches…",
];

export function RoomUploader({ presetProductSlug }: { presetProductSlug?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading" | "analyzing" | "done" | "error">("idle");
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Progress through scanning status messages during analysis
  useEffect(() => {
    if (status === "analyzing" || status === "uploading") {
      const interval = setInterval(() => {
        setScanStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
      }, 1600);
      return () => clearInterval(interval);
    } else {
      setScanStepIndex(0);
    }
  }, [status]);

  async function processFile(file: File) {
    setErrorMsg(null);

    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      setErrorMsg("Please upload a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg("Photo exceeds 16MB limit. Please select a smaller photo.");
      return;
    }

    // Step 1: Instant preview & client compression
    setStatus("compressing");
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const compressed = await compressImage(file, 1920, 1440, 0.85);

      // Check user session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Authenticated Flow: Upload to Supabase Storage & Rooms Table
        setStatus("uploading");
        const path = `${user.id}/${crypto.randomUUID()}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("room-photos")
          .upload(path, compressed.file, { contentType: "image/webp" });

        if (uploadError) throw uploadError;

        const { data: room, error: insertError } = await supabase
          .from("rooms")
          .insert({ user_id: user.id, image_path: path })
          .select("id")
          .single();

        if (insertError) throw insertError;

        setStatus("analyzing");

        const res = await fetch("/api/analyze-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: room.id }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Analysis failed");
        }

        router.push(
          presetProductSlug
            ? `/room/${room.id}/results?product=${encodeURIComponent(presetProductSlug)}`
            : `/room/${room.id}/results`
        );
      } else {
        // Guest Flow: Direct AI Vision Analysis via API route
        setStatus("analyzing");

        const res = await fetch("/api/analyze-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: compressed.base64,
            mimeType: compressed.mimeType,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Guest room analysis failed");
        }

        // Store guest session room data in sessionStorage
        const guestRoomData = {
          id: `guest-${Date.now()}`,
          photoUrl: localUrl,
          photoBase64: compressed.base64,
          analysis: data.analysis,
        };

        if (typeof window !== "undefined") {
          sessionStorage.setItem("explorekar_guest_room", JSON.stringify(guestRoomData));
        }

        router.push(
          presetProductSlug
            ? `/room/guest/results?product=${encodeURIComponent(presetProductSlug)}`
            : `/room/guest/results`
        );
      }
    } catch (err) {
      console.error("Room upload/analysis error:", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full">
      {/* Viewfinder Drop Zone */}
      <div
        className={`viewfinder-frame relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
          isDragOver
            ? "border-brass bg-brass-light/40 shadow-elevation scale-[1.01]"
            : "border-dashed border-line bg-flash hover:border-brass/60 hover:shadow-elevation"
        }`}
        onClick={() => status !== "analyzing" && status !== "uploading" && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload room photo"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Room preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-light border border-line text-ink shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Camera className="h-8 w-8 text-brass" />
            </div>
            <h3 className="mt-5 font-display text-base font-bold text-ink">
              Capture or choose a room photo
            </h3>
            <p className="mt-1 text-xs text-ink-muted max-w-xs leading-relaxed">
              Drag and drop your space here, or tap to choose from your camera roll.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-medium text-ink-muted">
              <Sparkles className="h-3 w-3 text-brass" />
              <span>Instant AI spatial analysis</span>
            </div>
          </div>
        )}

        {/* Cinematic Scanning HUD Overlay */}
        {(status === "compressing" || status === "uploading" || status === "analyzing") && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink/80 backdrop-blur-md px-6 text-center text-flash animate-in fade-in duration-300">
            {/* Pulsating Scanning Radar */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-brass/50 bg-ink shadow-viewfinder">
              <span className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-brass animate-pulse" />
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-brass animate-pulse" />
              <span className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-brass animate-pulse" />
              <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-brass animate-pulse" />
              <RefreshCw className="h-7 w-7 text-brass animate-spin" />
            </div>

            <p className="mt-6 font-display text-base font-bold tracking-tight text-flash">
              {SCAN_STEPS[scanStepIndex]}
            </p>
            <p className="mt-1.5 text-xs text-flash/60 font-mono">
              Step {scanStepIndex + 1} of {SCAN_STEPS.length}
            </p>

            {/* Scanning Progress Bar */}
            <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-flash/20">
              <div
                className="h-full bg-brass transition-all duration-500"
                style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input (supports mobile camera) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2.5 rounded-xl border border-terracotta/30 bg-terracotta-light p-3.5 text-xs font-medium text-terracotta"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
