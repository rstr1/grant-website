"use client";

import { useEffect, useMemo, useRef, useState, Suspense, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Album } from "../../data/albums";
import { useDiveScroll } from "./use-dive-scroll";

/* -------------------------------------------------------------------------- */
/*  Tunables — these shape the feel of the dive. None of this can be eyeballed
    from here; run `npm run dev` and adjust by feel.                          */
/* -------------------------------------------------------------------------- */

const DEPTH_SCALE = 40;        // world units per rating point (rating 10 -> y = -400)
const UNDULATE_RANGE = 0.5;    // rating-units of vertical wobble, each side (per the brief: 8/10 wanders 7.5-8.5)
const DRIFT_RANGE = 5;         // world units of slow left-right drift
const SURFACE_COLOUR = new THREE.Color("#bfe3e8");
const ABYSS_COLOUR = new THREE.Color("#020308");

/* -------------------------------------------------------------------------- */
/*  Small deterministic helpers — no Math.random() in render, so layout is
    stable across re-renders/hot-reloads.                                     */
/* -------------------------------------------------------------------------- */

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  // Avalanche finalizer (murmur-style bit mixing). Without this, two salts
  // that differ by only a couple of character codes (e.g. "x" vs "z") barely
  // change the final hash, since djb2 only lets the *last* processed
  // character contribute a small amount — producing near-identical, highly
  // correlated outputs instead of independent ones.
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return Math.abs(h);
}

function rand01(key: string, salt: string): number {
  return (hash(salt + ":" + key) % 10000) / 10000;
}

function fallbackColour(album: Album): string {
  if (typeof album.background === "number") {
    return `#${album.background.toString(16).padStart(6, "0")}`;
  }
  return album.background ?? "#2a2218";
}

// Guards against a missing/non-numeric `rating` silently NaN-ing every
// position computed downstream (Math.max/derived depths poison instantly).
const DEFAULT_RATING = 5;

function safeRating(album: Album): number {
  return Number.isFinite(album.rating) ? album.rating : DEFAULT_RATING;
}

function coverUrl(mbid: string): string {
  return `/api/cover/${mbid}`;
}

/* -------------------------------------------------------------------------- */
/*  Album placement                                                           */
/* -------------------------------------------------------------------------- */

type Placed = {
  album: Album;
  baseY: number;
  x: number;
  z: number;
  phase: number;
  speed: number;
  driftPhase: number;
  driftSpeed: number;
};

function usePlacedAlbums(albums: Album[]): Placed[] {
  return useMemo(
    () =>
      albums.map((album) => ({
        album,
        baseY: -safeRating(album) * DEPTH_SCALE,
        x: (rand01(album.key, "x") - 0.5) * 38,
        z: -8 - rand01(album.key, "z") * 46,
        phase: rand01(album.key, "phase") * Math.PI * 2,
        speed: 0.22 + rand01(album.key, "speed") * 0.22,
        driftPhase: rand01(album.key, "drift") * Math.PI * 2,
        driftSpeed: 0.05 + rand01(album.key, "driftspeed") * 0.07,
      })),
    [albums]
  );
}

/* -------------------------------------------------------------------------- */
/*  A single album — real cover art when it loads, a coloured plane otherwise */
/* -------------------------------------------------------------------------- */

function AlbumMarker({
  placed,
  onSelect,
}: {
  placed: Placed;
  onSelect: (album: Album) => void;
}) {
  const { album } = placed;
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [errored, setErrored] = useState(false);
  const hasValidMbid = Boolean(album.mbid && album.mbid.length === 36);

  useEffect(() => {
    if (!hasValidMbid) return;
    let cancelled = false;
    const url = coverUrl(album.mbid);
    console.log(`[dive] requesting cover for "${album.title}":`, url);
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (cancelled) return;
        console.log(`[dive] cover loaded for "${album.title}"`);
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.error(`[dive] cover FAILED for "${album.title}":`, err);
        setErrored(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [album.mbid, hasValidMbid, album.title]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const y =
      placed.baseY +
      Math.sin(t * placed.speed + placed.phase) * UNDULATE_RANGE * DEPTH_SCALE;
    const x = placed.x + Math.sin(t * placed.driftSpeed + placed.driftPhase) * DRIFT_RANGE;
    meshRef.current.position.set(x, y, placed.z);
  });

  const showFallback = !hasValidMbid || errored || !texture;
  const colour = fallbackColour(album);

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(album);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[5, 5]} />
      {showFallback ? (
        <meshBasicMaterial color={colour} side={THREE.DoubleSide} />
      ) : (
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient bioluminescent particles — atmosphere only, not clickable         */
/* -------------------------------------------------------------------------- */

function Plankton({ maxDepth }: { maxDepth: number }) {
  const count = 420;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand01(String(i), "px") - 0.5) * 80;
      positions[i * 3 + 1] = -rand01(String(i), "py") * maxDepth;
      positions[i * 3 + 2] = -5 - rand01(String(i), "pz") * 80;
      phases[i] = rand01(String(i), "ph") * Math.PI * 2;
      speeds[i] = 0.08 + rand01(String(i), "sp") * 0.14;
    }
    return { positions, phases, speeds };
  }, [maxDepth]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const baseY = positions[i * 3 + 1];
      attr.setY(i, baseY + Math.sin(t * speeds[i] + phases[i]) * 2);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.4} color="#9fe8d8" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Camera descent + fog/light darkening, driven by scroll progress           */
/* -------------------------------------------------------------------------- */

function DepthRig({
  progressRef,
  maxDepth,
}: {
  progressRef: RefObject<number>;
  maxDepth: number;
}) {
  const { scene, camera } = useThree();
  const fogRef = useRef(new THREE.FogExp2(SURFACE_COLOUR.getHex(), 0.012));

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((_state, delta) => {
    const targetY = -progressRef.current * maxDepth;
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4);

    const depthT = Math.min(1, Math.abs(camera.position.y) / maxDepth);
    const colour = SURFACE_COLOUR.clone().lerp(ABYSS_COLOUR, depthT);

    fogRef.current.color.copy(colour);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(colour);
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Scene + exported Canvas wrapper                                          */
/* -------------------------------------------------------------------------- */

function Scene({
  albums,
  progressRef,
  onSelect,
}: {
  albums: Album[];
  progressRef: RefObject<number>;
  onSelect: (album: Album) => void;
}) {
  const placed = usePlacedAlbums(albums);

  useEffect(() => {
    albums.forEach((a) => {
      if (!Number.isFinite(a.rating)) {
        console.warn(
          `[dive] "${a.title}" (key: "${a.key}") has a missing or non-numeric rating:`,
          a.rating,
          `— falling back to ${DEFAULT_RATING}.`
        );
      }
    });
  }, [albums]);

  const maxRating = useMemo(
    () => Math.max(...albums.map((a) => safeRating(a)), 1),
    [albums]
  );
  const maxDepth = maxRating * DEPTH_SCALE + UNDULATE_RANGE * DEPTH_SCALE;

  return (
    <>
      <DepthRig progressRef={progressRef} maxDepth={maxDepth} />
      {placed.map((p) => (
        <AlbumMarker key={p.album.key} placed={p} onSelect={onSelect} />
      ))}
      <Plankton maxDepth={maxDepth} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.4} intensity={0.6} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function DiveScene({
  albums,
  onSelect,
  sectionRef,
}: {
  albums: Album[];
  onSelect: (album: Album) => void;
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const progressRef = useDiveScroll(sectionRef);

  return (
    <Canvas
      camera={{ position: [0, 0, 22], fov: 46, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={["#bfe3e8"]} />
      <Suspense fallback={null}>
        <Scene albums={albums} progressRef={progressRef} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
