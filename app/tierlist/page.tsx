"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Footer from '../footer';
import Image from 'next/image';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';
import {
  albumData,
  TIERS,
  TIER_COLOURS,
  type Album,
  type Tier,
} from "../data/albums";

const fullConfig = resolveConfig(tailwindConfig);
const dithered_background = fullConfig.theme.colors.dithered_background;
const gradient_background = fullConfig.theme.colors.gradient_background;

/**
 * Use the `release-group` endpoint rather than `release` because a single
 * album has many releases (vinyl, CD, remasters) and release-group resolves
 * to one canonical front cover.
 */
function coverUrl(mbid: string): string {
  return `https://coverartarchive.org/release-group/${mbid}/front-500.jpg`;
}

export default function Tierlist() {
  const [selected, setSelected] = useState<Album | null>(null);

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
      <section className="min-h-[25vh] flex flex-col justify-end px-[10%]"
        style={{ background: `linear-gradient(to top, ${dithered_background}, ${gradient_background})` }}
      >
        {/* Header */}
        <div className="">
          <h1
            className="text-5xl lg:text-7xl md:text-6xl font-bold font-playfair tracking-tight"
            style={{ textShadow: "6px 0px rgba(255, 255, 255, 0.3)" }}
          >
            Albums i&apos;ve listened to
          </h1>
          <p className="md:ml-[60vh] italic mt-3 text-xl sm:text-base text-dark_text/70 font-playfair max-w-2xl">
            music rocks
          </p>
        </div>
      </section>
        
      <div className="pt-12 pb-16 md:px-16 px-10 max-w-6xl mx-auto">

        {/* Tier rows */}
        <div className="flex flex-col gap-4">
          {TIERS.map((tier) => (
            <TierRow
              key={tier}
              tier={tier}
              albums={albumData.filter((a) => a.tier === tier)}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Slide-in review panel */}
        <ReviewPanel album={selected} onClose={() => setSelected(null)} />
      </div>

      <div>
        {/* ── Fade to footer ── */}
          <div
              className="h-[20vh]"
              style={{
              background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`,
              }}
          />
          <Footer/>
      </div>

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
/*  Tier row                                                                  */
/* -------------------------------------------------------------------------- */

function TierRow({ tier, albums, onSelect }: {
  tier: Tier;
  albums: Album[];
  onSelect: (a: Album) => void;
}) {
  const colours = TIER_COLOURS[tier];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [albums]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        document.getElementById("scroll-container")?.scrollBy({ top: e.deltaY });
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className="flex items-stretch rounded-lg min-h-[140px] md:min-h-[180px]"
    >
      {/* Tier label */}
      <div
        className="shrink-0 w-32 md:w-40 mx-4 my-4 pb-2 flex items-center justify-center font-playfair text-6xl md:text-8xl font-bold m-1 rounded-xl"
        style={{
          backgroundColor: colours.bg,
          color: `color-mix(in srgb, ${colours.bg} 80%, black)`,
          backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${colours.bg} 90%, white) 0%, ${colours.bg} 50%, color-mix(in srgb, ${colours.bg} 70%, black) 100%)`,
          boxShadow: `
            inset -4px -4px 0px color-mix(in srgb, ${colours.bg} 50%, black)
          `,
          
        }}
      >
        <span style={{
          textShadow: `
            0 1px 1px color-mix(in srgb, ${colours.bg} 80%, white),
            0 -1px 1px color-mix(in srgb, ${colours.bg} 20%, black)
          `
        }}>
          {tier}
        </span>
      </div>

      {/* Albums + fade indicator */}
      <div className="relative flex-1 overflow-hidden pl-2 py-2">
        <div
          ref={scrollRef}
          className="flex-1 p-4 flex flex-nowrap gap-4 rounded-xl items-center min-h-[160px] md:min-h-[192px] overflow-x-auto overflow-y-hidden overscroll-none scrollbar-hide"
          style={{ backgroundColor: `color-mix(in srgb, ${colours.bg} 80%, black)` }}
        >
          {albums.length === 0 ? (
            <span className="text-dark_text/30 text-sm italic font-jost pl-1">
              nothing here yet
            </span>
          ) : (
            albums.map((album) => (
              <AlbumTile key={album.key} album={album} onSelect={onSelect} />
            ))
          )}
        </div>

        {/* Fade + chevron */}
        <div
          className={`absolute top-2 right-0 h-48 w-24 rounded-xl flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
          style={{
            background: `linear-gradient(to right, transparent, color-mix(in srgb, ${colours.bg} 100%, black))`,
          }}
        >
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Album tile                                                                */
/* -------------------------------------------------------------------------- */

function AlbumTile({
  album,
  onSelect,
}: {
  album: Album;
  onSelect: (a: Album) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const hasValidMbid = album.mbid && album.mbid.length === 36;
  const showPlaceholder = !hasValidMbid || errored;

  const fallbackColour =
    typeof album.background === "number"
      ? `#${album.background.toString(16).padStart(6, "0")}`
      : album.background || "#2a2218";

  return (
    <button
      onClick={() => onSelect(album)}
      className="group relative w-32 h-32 md:h-40 md:w-40 shrink-0 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-110 hover:shadow-xl focus:outline-none"
      style={{
        backgroundColor: fallbackColour,
        outline: 'none',
        boxShadow: `0 4px 12px color-mix(in srgb, ${fallbackColour} 40%, black)`,
      }}
      onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${fallbackColour}`)}
      onBlur={e => (e.currentTarget.style.boxShadow = '')}
      aria-label={`View review of ${album.title} by ${album.artist}`}
    >
      {!showPlaceholder ? (
        <>
          {/* Skeleton layer — shows until the image load event fires. */}
          {!loaded && (
            <div
              className="absolute inset-0 tierlist-shimmer"
              style={{ backgroundColor: fallbackColour }}
              aria-hidden="true"
            />
          )}
          <Image
            src={coverUrl(album.mbid)}
            alt={`${album.title} cover`}
            fill
            className={`object-cover transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center font-jost">
          <span className="text-[9px] leading-tight text-white/90 font-bold">
            {album.title}
          </span>
          <span className="text-[8px] leading-tight text-white/50 mt-0.5">
            {album.artist}
          </span>
        </div>
      )}
    </button>
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
