"use client";

import { useEffect, useMemo, useRef, useState, Suspense, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Album } from "../../data/albums";
import { useDiveScroll } from "./use-dive-scroll";
import { Html } from "@react-three/drei";

/* -------------------------------------------------------------------------- */
/*  Tunables                                                                  */
/* -------------------------------------------------------------------------- */

const LAYOUT_SEED = "penis";

const DEPTH_SCALE = 40;
const UNDULATE_RANGE = 0.5;
const DRIFT_RANGE = 5;
const SURFACE_COLOUR = new THREE.Color("#66b2b2");
const ABYSS_COLOUR = new THREE.Color("#020308");

const HOVER_EASE = 8;
const HOVER_SCALE = 0.5
const REST_TILT_X = THREE.MathUtils.degToRad(32);
const REST_TILT_Z = THREE.MathUtils.degToRad(14);

const COVER_SIZE = 5;
const EDGE_MARGIN = 1.5;

const REFERENCE_HALF_WIDTH = 19;
const MIN_SEPARATION = COVER_SIZE * 1.6;
const COLLISION_Y_WINDOW = 2 * UNDULATE_RANGE * DEPTH_SCALE;
const MAX_PLACEMENT_ATTEMPTS = 64;

/* -------------------------------------------------------------------------- */
/*  Small deterministic helpers                                               */
/* -------------------------------------------------------------------------- */

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return Math.abs(h);
}

function rand01(key: string, salt: string): number {
  return (hash(LAYOUT_SEED + ":" + salt + ":" + key) % 10000) / 10000;
}

function fallbackColour(album: Album): string {
  if (typeof album.background === "number") {
    return `#${album.background.toString(16).padStart(6, "0")}`;
  }
  return album.background ?? "#2a2218";
}

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
  xLane: number; // -1..1, scaled to a screen-safe width per-frame
  z: number;
  phase: number;
  speed: number;
  driftPhase: number;
  driftSpeed: number;
  tiltX: number;
  tiltZ: number;
};

function usePlacedAlbums(albums: Album[]): Placed[] {
  return useMemo(() => {
    const placed: Placed[] = [];

    albums.forEach((album) => {
      const baseY = -safeRating(album) * DEPTH_SCALE;

      // Only check against albums close enough in depth to plausibly be visible together
      const neighbours = placed.filter(
        (p) => Math.abs(p.baseY - baseY) < COLLISION_Y_WINDOW
      );

      const candidate = (attempt: number) => {
        const salt = `attempt${attempt}`;
        const xLane = rand01(album.key, `x:${salt}`) * 2 - 1;
        const z = -8 - rand01(album.key, `z:${salt}`) * 46;
        const x = xLane * REFERENCE_HALF_WIDTH;
        const minDist = neighbours.length
          ? Math.min(...neighbours.map((n) => Math.hypot(x - n.xLane * REFERENCE_HALF_WIDTH, z - n.z)))
          : Infinity;
        return { xLane, z, minDist };
      };

      let best = candidate(0);
      for (let attempt = 1; attempt < MAX_PLACEMENT_ATTEMPTS && best.minDist < MIN_SEPARATION; attempt++) {
        const next = candidate(attempt);
        if (next.minDist > best.minDist) best = next;
      }

      if (best.minDist < MIN_SEPARATION) {
        console.warn(
          `[dive] couldn't find a fully clear spot for "${album.title}" after ${MAX_PLACEMENT_ATTEMPTS} attempts ` +
          `(closest neighbour ${best.minDist.toFixed(1)} units away, target ${MIN_SEPARATION}). ` +
          `It may visibly overlap a similarly-rated album — try nudging its rating slightly.`
        );
      }

      placed.push({
        album,
        baseY,
        xLane: best.xLane,
        z: best.z,
        phase: rand01(album.key, "phase") * Math.PI * 2,
        speed: 0.22 + rand01(album.key, "speed") * 0.22,
        driftPhase: rand01(album.key, "drift") * Math.PI * 2,
        driftSpeed: 0.05 + rand01(album.key, "driftspeed") * 0.07,
        tiltX: (rand01(album.key, "tiltX") - 0.5) * 2 * REST_TILT_X,
        tiltZ: (rand01(album.key, "tiltZ") - 0.5) * 2 * REST_TILT_Z,
      });
    });

    return placed;
  }, [albums]);
}

/* -------------------------------------------------------------------------- */
/*  A single album - cover art or blank square                                */
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
  const glowRef = useRef<THREE.Mesh>(null);
  const lookTarget = useMemo(() => new THREE.Object3D(), []);
  const restQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(placed.tiltX, 0, placed.tiltZ)),
    [placed.tiltX, placed.tiltZ]
  );
  const hoverT = useRef(0);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);
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

  useFrame(({ clock, camera }, delta) => {
    if (!meshRef.current) return;
  const t = clock.getElapsedTime();
  const y =
    placed.baseY +
    Math.sin(t * placed.speed + placed.phase) * UNDULATE_RANGE * DEPTH_SCALE;

    const perspCam = camera as THREE.PerspectiveCamera;
    const dist = perspCam.position.z - placed.z;
    const verticalHalfAngle = THREE.MathUtils.degToRad(perspCam.fov / 2);
    const halfWidth = dist * Math.tan(verticalHalfAngle) * perspCam.aspect;
    const footprint = (COVER_SIZE / 2) * (1 + HOVER_SCALE);
    const safeHalfWidth = Math.max(0, halfWidth - footprint - EDGE_MARGIN);

    const baseX = placed.xLane * safeHalfWidth; // full available width, not pre-shrunk
    const drift = Math.sin(t * placed.driftSpeed + placed.driftPhase) * DRIFT_RANGE;
    const x = THREE.MathUtils.clamp(baseX + drift, -safeHalfWidth, safeHalfWidth);
    meshRef.current.position.set(x, y, placed.z);

    const goal = hovered ? 1 : 0;
    hoverT.current = THREE.MathUtils.lerp(hoverT.current, goal, Math.min(1, delta * HOVER_EASE));
    const h = hoverT.current;

    meshRef.current.scale.setScalar(1 + h * HOVER_SCALE);

    // Object3D.lookAt() (unlike Camera.lookAt()) points local +Z at the
    // target — which is exactly PlaneGeometry's front-face direction, so
    // the result can be used directly with no extra flip.
    lookTarget.position.copy(meshRef.current.position);
    lookTarget.lookAt(camera.position);
    meshRef.current.quaternion.slerpQuaternions(restQuaternion, lookTarget.quaternion, h);

    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = h * 0.55;
    }
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
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[5, 5]} />
      {showFallback ? (
        <meshBasicMaterial key="fallback" color={colour} side={THREE.DoubleSide} />
      ) : (
        <meshBasicMaterial key="texture" map={texture} side={THREE.DoubleSide} />
      )}

      {hovered && (
        <Html position={[0, 3.4, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div className="text-center font-jost whitespace-nowrap">
            <div className="text-white font-playfair text-4xl drop-shadow-lg">
              {album.title}
            </div>
            <div className="text-white/70 text-3xl">{album.artist}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient particles                                                         */
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
/*  Camera descent + fog/light darkening --> scroll progress                  */
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
      camera={{ position: [0, 0, 30], fov: 46, near: 0.1, far: 400 }}
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
