import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function ProductImageViewer({
  open,
  images,
  name,
  onClose,
}: {
  open: boolean;
  images: string[];
  name: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const safe = images.length > 0 ? images : [];

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % safe.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + safe.length) % safe.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, safe.length, onClose]);

  if (!open || safe.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % safe.length);
  const prev = () => setIndex((i) => (i - 1 + safe.length) % safe.length);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-marble/20 bg-marble/10 text-marble transition hover:bg-marble hover:text-ink"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="absolute left-1/2 top-5 -translate-x-1/2 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-marble/60">Soltan</p>
        <h3 className="mt-1 font-serif text-lg italic text-marble">{name}</h3>
      </div>

      {/* Image stage */}
      <div
        className="relative flex h-full w-full max-w-5xl items-center justify-center px-16 py-24"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={index}
          src={safe[index]}
          alt={`${name} ${index + 1}`}
          className="max-h-full max-w-full object-contain shadow-[0_30px_120px_-20px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300"
        />

        {safe.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label={t("card.prev")}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-marble/20 bg-marble/10 text-marble transition hover:bg-marble hover:text-ink"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label={t("card.next")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-marble/20 bg-marble/10 text-marble transition hover:bg-marble hover:text-ink"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safe.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {safe.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              className={`h-14 w-12 overflow-hidden border transition ${
                i === index ? "border-marble opacity-100" : "border-marble/20 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
