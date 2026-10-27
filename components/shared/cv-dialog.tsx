"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { asset } from "@/lib/asset";

const CV_PDF = asset("/cv/danial-dirar-cv.pdf");
const CV_PAGES = [
  { src: asset("/cv/page-1.webp"), width: 1700, height: 2200 },
  { src: asset("/cv/page-2.webp"), width: 1700, height: 2200 },
] as const;

const noopSubscribe = () => () => {};

/**
 * "View CV" button + animated overlay viewer.
 * Preview pages are pre-rendered webp (crisp everywhere, incl. mobile where
 * embedded PDF viewers don't render); Print/Download use the real PDF.
 */
export function CvDialog() {
  const [open, setOpen] = useState(false);
  // Portal target only exists client-side: false in the server snapshot.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const printFrame = useRef<HTMLIFrameElement | null>(null);

  // Print the actual PDF through a hidden same-origin iframe; fall back to
  // opening it in a new tab (whose viewer has its own print button).
  const handlePrint = useCallback(() => {
    const frame = printFrame.current;
    try {
      if (frame?.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        return;
      }
    } catch {
      /* fall through */
    }
    window.open(CV_PDF, "_blank", "noopener");
  }, []);

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
        <FileText className="size-4" />
        View CV
      </Button>

      {/* Portaled to <body>: ancestors with CSS transforms (e.g. the Reveal
          animation wrapper) hijack position:fixed and pin the overlay inside
          their own box — the portal escapes them so this is a true lightbox. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="cv-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm md:p-6"
                onClick={() => setOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Curriculum vitae"
              >
                <motion.div
                  initial={{ opacity: 0, y: 42, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 28, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="terminal-window flex h-full max-h-[94vh] w-[min(96vw,60rem)] flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
              {/* titlebar */}
              <div className="terminal-titlebar justify-between">
                <div className="flex items-center gap-2">
                  <span className="terminal-dot bg-red-400/80" />
                  <span className="terminal-dot bg-amber-400/80" />
                  <span className="terminal-dot bg-emerald-400/80" />
                  <span className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline">
                    {site.handle}@haifa: ~$ open cv.pdf
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 font-mono text-xs">
                    <a href={CV_PDF} download="Md-Danial-Dirar-CV.pdf">
                      <Download className="size-3.5" />
                      <span className="hidden sm:inline">download</span>
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 font-mono text-xs"
                    onClick={handlePrint}
                  >
                    <Printer className="size-3.5" />
                    <span className="hidden sm:inline">print</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* pages — big, naturally scrollable */}
              <div className="flex-1 overflow-y-auto bg-secondary/40 p-3 md:p-6">
                <div className="mx-auto max-w-4xl space-y-5">
                  {CV_PAGES.map((page, i) => (
                    <motion.div
                      key={page.src}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.08, duration: 0.35 }}
                      className="overflow-hidden rounded-lg border border-border/60 bg-white shadow-lg"
                    >
                      <Image
                        src={page.src}
                        alt={`CV page ${i + 1}`}
                        width={page.width}
                        height={page.height}
                        sizes="(min-width: 1024px) 896px, 100vw"
                        priority={i === 0}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
                </motion.div>

                {/* hidden iframe used by the print button */}
                <iframe ref={printFrame} src={CV_PDF} title="CV print frame" className="hidden" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
