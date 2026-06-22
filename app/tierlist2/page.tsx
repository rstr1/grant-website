"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  albumData,
  type Album,
} from "../data/albums";
import DiveScene from "./dive/dive-scene";

// Total scroll length of the dive, in vh.
const DIVE_VH = 1200;


function coverUrl(mbid: string): string {
  return `https://coverartarchive.org/release-group/${mbid}/front-500.jpg`;
}

// Stops THREE.Clock deprecation warning
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.toString().includes('THREE.Clock')) return;
    originalWarn(...args);
  };
}

export default function Tierlist() {
  const [selected, setSelected] = useState<Album | null>(null);
  const diveSectionRef = useRef<HTMLDivElement>(null);

  // Gentle container fade-in on first mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // opacity-0 --> opacity-100.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Close panel on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div id="scroll-container"
      className={`transition-opacity duration-500 ease-out ${mounted ? "opacity-100" : "opacity-0"} overflow-y-scroll h-screen scrollbar-hide`}
    >
      {/* Dive */}
      <section ref={diveSectionRef} className="relative block" style={{ height: `${DIVE_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {mounted && (
            <DiveScene
              albums={albumData}
              onSelect={setSelected}
              sectionRef={diveSectionRef}
            />
          )}
        </div>
      </section>

      {/* Slide-in review panel */}
      <ReviewPanel album={selected} onClose={() => setSelected(null)} />

      {/* Shimmer keyframes for skeleton placeholders */}
      <style jsx global>{`
        @keyframes tierlist-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tierlist-shimmer {
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.06) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: tierlist-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

    </div>
  );

}

/* -------------------------------------------------------------------------- */
/*  Slide-in review panel                                                     */
/* -------------------------------------------------------------------------- */

function ReviewPanel({
  album,
  onClose,
}: {
  album: Album | null;
  onClose: () => void;
}) {
  const isOpen = album !== null;

  // Keep the last album visible during the closing transition
  const [displayed, setDisplayed] = useState<Album | null>(null);
  useEffect(() => {
    if (album) setDisplayed(album);
  }, [album]);

  const shown = album ?? displayed;

  const [panelLoaded, setPanelLoaded] = useState(false);
  const [panelErrored, setPanelErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset load state ONLY when switching to a different album — not when
  // closing (album -> null) with the same album still displayed. Otherwise
  // we'd reset the flag against a cached <img> that will never fire onLoad
  // again, leaving the cover stuck invisible on reopen.
  const prevKeyRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const nextKey = album?.key;
    if (nextKey && nextKey !== prevKeyRef.current) {
      setPanelLoaded(false);
      setPanelErrored(false);
      prevKeyRef.current = nextKey;
    }
  }, [album?.key]);

  // If the browser already has the image cached, onLoad will have fired
  // before React attached the onLoad handler, so panelLoaded would remain
  // false forever. Check `.complete` on the image ref once it mounts and
  // flip the flag synchronously.
  const handleImgRef = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setPanelLoaded(true);
    }
  }, []);

  const hasValidMbid = shown?.mbid && shown.mbid.length === 36;
  const showPanelPlaceholder = !hasValidMbid || panelErrored;

  // Only render the metadata row if the field is actually populated.
  // (Otherwise, emptied genre/favoriteTrack would render a bare label.)
  const hasGenre = shown?.genre && shown.genre.trim().length > 0;
  const hasFavoriteTrack = shown?.favouriteTrack && shown.favouriteTrack.trim().length > 0;
  const hasReview = shown?.review && shown.review.trim().length > 0;
  const hasAnyMeta = hasGenre || hasFavoriteTrack;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-dithered_background border-l-1 border-dark_nav_border/10 shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col overscroll-x-none`}
      >
        {shown && (
          <>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-dark_text transition-colors z-10"
              aria-label="Close review"
            >
              ×
            </button>

            <div className="overflow-y-auto flex-1 scrollbar-hide">
              {/* Cover */}
              <div
                className="relative w-full aspect-square flex items-center justify-center overflow-hidden scale-95 border-2 border-white/20"
                style={{
                  backgroundColor:
                    typeof shown.background === "number"
                      ? `#${shown.background.toString(16).padStart(6, "0")}`
                      : shown.background || "#2a2218",
                }}
              >
                {!showPanelPlaceholder ? (
                  <>
                    {!panelLoaded && (
                      <div
                        className="absolute inset-0 tierlist-shimmer"
                        aria-hidden="true"
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={handleImgRef}
                      src={coverUrl(shown.mbid)}
                      alt={`${shown.title} cover`}
                      className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${panelLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setPanelLoaded(true)}
                      onError={() => setPanelErrored(true)}
                    />
                  </>
                ) : (
                  <div className="text-center px-8">
                    <div className="text-xl font-playfair text-white/70">
                      {shown.title}
                    </div>
                    <div className="text-sm text-white/40 mt-2 font-jost italic">
                      cover art unavailable
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 font-jost">
                <h2 className="text-3xl font-playfair font-bold leading-tight">
                  {shown.title}
                </h2>
                <p className="text-base text-dark_text/70 mt-1">
                  {shown.artist} &middot; {shown.year}
                </p>

                {hasAnyMeta && (
                  <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {hasGenre && (
                      <>
                        <dt className="text-dark_text/50 uppercase tracking-wider text-xs pt-0.5">
                          Genre
                        </dt>
                        <dd>{shown.genre}</dd>
                      </>
                    )}
                    {hasFavoriteTrack && (
                      <>
                        <dt className="text-dark_text/50 uppercase tracking-wider text-xs pt-0.5">
                          Fav track
                        </dt>
                        <dd className="italic">{shown.favouriteTrack}</dd>
                      </>
                    )}
                  </dl>
                )}

                {hasReview ? (
                  <div className="mt-6 pt-6 border-t border-dark_nav_border/20">
                    <p className="text-[15px] leading-relaxed text-dark_text/90">
                      {shown.review}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-dark_nav_border/20">
                    <p className="text-sm italic text-dark_text/40">
                      Review coming soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
