"use client";

import { useEffect, useMemo, useRef, useState, Suspense, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Album } from "../../data/albums";
import { useDiveScroll } from "./use-dive-scroll";
import { Html } from "@react-three/drei";

/* -------------------------------------------------------------------------- */
/*  Colours                                                                   */
/* -------------------------------------------------------------------------- */

// Background Colour
const BACKGROUND_COLOUR = new THREE.Color("#ffffff")

// Colour stops for the 3-stop underwater gradient.
const SURFACE_COLOUR = new THREE.Color("#0a73ab");
const MID_OCEAN_COLOUR = new THREE.Color("#0b3d6b");
const ABYSS_COLOUR   = new THREE.Color("#020308");

// Sky colours
const SKY_ZENITH  = new THREE.Color("#0062ff");
const SKY_HORIZON = new THREE.Color("#ffce5c");

// Sun colours
const SUN_COLOUR  = new THREE.Color("#fff8b0");
const CORONA_COLOUR  = new THREE.Color("#f4d35e");

// Plankton colour
const PLANKTON_COLOUR = new THREE.Color("#9fe8d8")

// Cloud colour
const CLOUD_COLOUR = new THREE.Color("#f0f8ff")

// Album fallback colour
const FALLBACK_COLOUR = "#000000"


/* -------------------------------------------------------------------------- */
/*  Tunables                                                                  */
/* -------------------------------------------------------------------------- */

// const LAYOUT_SEED = "7";
const LAYOUT_SEED = Math.random().toString(36).slice(2);


const DEPTH_SCALE    = 40;
const UNDULATE_RANGE = 0.5;
const DRIFT_RANGE    = 5;

const HOVER_EASE  = 8;
const HOVER_SCALE = 0.5;
const REST_TILT_X = THREE.MathUtils.degToRad(32);
const REST_TILT_Z = THREE.MathUtils.degToRad(14);

const COVER_SIZE  = 5;
const EDGE_MARGIN = 1.5;

const REFERENCE_HALF_WIDTH   = 19;
const MIN_SEPARATION         = COVER_SIZE * 1.6;
const COLLISION_Y_WINDOW     = 2 * UNDULATE_RANGE * DEPTH_SCALE;
const MAX_PLACEMENT_ATTEMPTS = 64;
const DEFAULT_RATING         = 5;

const SELECTED_DISTANCE = 15;
const SELECTED_X_OFFSET = -3;
const SELECTED_Y_OFFSET = 0;

/* -------------------------------------------------------------------------- */
/*  Water/Surface Tunables                                                    */
/* -------------------------------------------------------------------------- */

// World-Y of the camera when scroll progress = 0 (above the surface).
const ABOVE_WATER_HEIGHT = 5;

// Fraction of total scroll progress consumed by the above-water descent.
const SURFACE_THRESHOLD = 0.1;

/* -------------------------------------------------------------------------- */
/*  Camera Pitch Tunables                                                     */
/* -------------------------------------------------------------------------- */

// Camera Pitch Angles
const PITCH_ABOVE = 0.2;
const PITCH_DIVE = -0.55;

// Depth at which Pitch returns to 0
const PITCH_RECOVER_DEPTH = 40;

/* -------------------------------------------------------------------------- */
/*  GLSL shaders                                                              */
/* -------------------------------------------------------------------------- */

// Sky dome: gradient sphere (BackSide) that follows the camera.
const SKY_VERT = /* glsl */`
  varying vec3 vWorldNormal;
  void main() {
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */`
  varying vec3 vWorldNormal;
  uniform vec3  uZenith;
  uniform vec3  uHorizon;
  uniform float uAlpha;
  void main() {
    // vWorldNormal.y: -1 at bottom hemisphere, +1 at top.
    float t   = clamp(vWorldNormal.y * 0.5 + 0.5, 0.0, 1.0);
    t         = pow(t, 0.55); // push gradient toward zenith for a richer sky
    vec3 col  = mix(uHorizon, uZenith, t);
    gl_FragColor = vec4(col, uAlpha);
  }
`;

// Animated water surface plane (horizontal, DoubleSide).
// The mesh is rotated -PI/2 around X, so local XY → world XZ;
// local Z displacement → world Y (wave height).
const WATER_VERT = /* glsl */`
  uniform float uTime;
  varying float vElev;
  void main() {
    vec3 p = position;
    // Four overlapping sine waves for a natural ocean surface.
    p.z += sin(p.x * 0.22 + uTime * 0.85) * 0.80   // medium chop, left-right
         + sin(p.y * 0.18 + uTime * 0.60) * 0.65   // medium chop, fore-aft
         + sin((p.x + p.y) * 0.13 + uTime * 1.15)  * 0.40   // diagonal rip
         + sin(p.x * 0.05  + uTime * 0.32) * 1.30;  // long lazy swell
    vElev = p.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const WATER_FRAG = /* glsl */`
  uniform float uAlpha;
  varying float vElev;
  void main() {
    // Wave crests are lighter/more turquoise; troughs are darker blue.
    float t   = clamp(vElev * 0.35 + 0.5, 0.0, 1.0);
    vec3  col = mix(vec3(0.04, 0.20, 0.44), vec3(0.36, 0.82, 0.88), t);
    gl_FragColor = vec4(col, uAlpha);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Deterministic helpers.                                                    */
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
  return album.background ?? FALLBACK_COLOUR;
}

function safeRating(album: Album): number {
  return Number.isFinite(album.rating) ? album.rating : DEFAULT_RATING;
}

function coverUrl(mbid: string): string {
  return `/api/cover/${mbid}?size=500`;
}

function coverUrlHQ(mbid: string): string {
  return `/api/cover/${mbid}?size=1200`;
}

/* -------------------------------------------------------------------------- */
/*  Album placement                                                           */
/* -------------------------------------------------------------------------- */

type Placed = {
  album: Album;
  baseY: number;
  xLane: number;
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
        phase:      rand01(album.key, "phase")      * Math.PI * 2,
        speed:      0.22 + rand01(album.key, "speed")      * 0.22,
        driftPhase: rand01(album.key, "drift")      * Math.PI * 2,
        driftSpeed: 0.05 + rand01(album.key, "driftspeed") * 0.07,
        tiltX: (rand01(album.key, "tiltX") - 0.5) * 2 * REST_TILT_X,
        tiltZ: (rand01(album.key, "tiltZ") - 0.5) * 2 * REST_TILT_Z,
      });
    });

    return placed;
  }, [albums]);
}

/* -------------------------------------------------------------------------- */
/*  AlbumMarker                                                               */
/* -------------------------------------------------------------------------- */

function AlbumMarker({
  placed,
  isSelected,
  onSelect,
  onDeselect,
}: {
  placed: Placed;
  isSelected: boolean;
  onSelect: (album: Album) => void;
  onDeselect: () => void;
}) {
  const { album } = placed;
  const meshRef       = useRef<THREE.Mesh>(null);
  const glowRef       = useRef<THREE.Mesh>(null);
  const lookTarget    = useMemo(() => new THREE.Object3D(), []);
  const restQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(placed.tiltX, 0, placed.tiltZ)),
    [placed.tiltX, placed.tiltZ]
  );
  const hoverT = useRef(0);
  const [texture, setTexture]   = useState<THREE.Texture | null>(null);
  const [hqTexture, setHqTexture] = useState<THREE.Texture | null>(null);
  const [errored, setErrored]   = useState(false);
  const [hovered, setHovered]   = useState(false);
  const hasValidMbid = Boolean(album.mbid && album.mbid.length === 36);
  const lerpedPos   = useRef(new THREE.Vector3());
  const naturalPos  = useRef(new THREE.Vector3());
  const selectedPos = useRef(new THREE.Vector3());
  const camDir      = useRef(new THREE.Vector3());
  const posInit     = useRef(false);

  // Small album cover fetch
  useEffect(() => {
    if (!hasValidMbid) return;
    let cancelled = false;
    const url    = coverUrl(album.mbid);
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
    return () => { cancelled = true; };
  }, [album.mbid, hasValidMbid, album.title]);

  // Large album cover fetch
  useEffect(() => {
  if (!isSelected || !hasValidMbid || hqTexture) return;
  let cancelled = false;
  new THREE.TextureLoader().load(
    coverUrlHQ(album.mbid),
    (tex) => {
      if (cancelled) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      setHqTexture(tex);
    },
    undefined,
    () => {} // fail silently
  );
  return () => { cancelled = true; };
}, [isSelected, hasValidMbid, album.mbid, hqTexture]);

  useFrame(({ clock, camera }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    /* ── Natural position (undulation + drift) ─────────────────────── */
    const naturalY = placed.baseY + Math.sin(t * placed.speed + placed.phase) * UNDULATE_RANGE * DEPTH_SCALE;
    const perspCam       = camera as THREE.PerspectiveCamera;
    const dist           = perspCam.position.z - placed.z;
    const verticalHalfAngle = THREE.MathUtils.degToRad(perspCam.fov / 2);
    const halfWidth      = dist * Math.tan(verticalHalfAngle) * perspCam.aspect;
    const footprint      = (COVER_SIZE / 2) * (1 + HOVER_SCALE);
    const safeHalfWidth  = Math.max(0, halfWidth - footprint - EDGE_MARGIN);
    const baseX          = placed.xLane * safeHalfWidth;
    const drift          = Math.sin(t * placed.driftSpeed + placed.driftPhase) * DRIFT_RANGE;
    const naturalX       = THREE.MathUtils.clamp(baseX + drift, -safeHalfWidth, safeHalfWidth);
    naturalPos.current.set(naturalX, naturalY, placed.z);

    // Seed the lerped position on first frame so there's no snap from origin.
    if (!posInit.current) {
      lerpedPos.current.copy(naturalPos.current);
      posInit.current = true;
    }

    /* ── Selected target: centre of camera view ────────────────────── */
    if (isSelected) {
      camera.getWorldDirection(camDir.current);
      selectedPos.current.copy(camera.position).addScaledVector(camDir.current, SELECTED_DISTANCE);
      selectedPos.current.y += SELECTED_Y_OFFSET;
      selectedPos.current.x += SELECTED_X_OFFSET;
    }

    const target    = isSelected ? selectedPos.current : naturalPos.current;
    const lerpSpeed = isSelected ? 6 : 4;
    lerpedPos.current.lerp(target, Math.min(1, delta * lerpSpeed));
    meshRef.current.position.copy(lerpedPos.current);

    /* ── Hover / scale ─────────────────────────────────────────────── */
    // No hover scale while selected — the album is already prominent.
    const hoverGoal = (hovered && !isSelected) ? 1 : 0;
    hoverT.current  = THREE.MathUtils.lerp(hoverT.current, hoverGoal, Math.min(1, delta * HOVER_EASE));
    const h         = hoverT.current;
    meshRef.current.scale.setScalar(isSelected ? 1.0 : 1 + h * HOVER_SCALE);

    /* ── Rotation ──────────────────────────────────────────────────── */
    lookTarget.position.copy(meshRef.current.position);
    lookTarget.lookAt(camera.position);
    if (isSelected) {
      // Face camera
      meshRef.current.quaternion.copy(lookTarget.quaternion);
    } else {
      meshRef.current.quaternion.slerpQuaternions(restQuaternion, lookTarget.quaternion, h);
    }

    /* ── Glow (existing) ───────────────────────────────────────────── */
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = h * 1;
    }
  });

  const activeTexture = hqTexture ?? texture;
  const showFallback  = !hasValidMbid || errored || !activeTexture;
  const colour       = fallbackColour(album);

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); if (isSelected) { onDeselect(); } else { onSelect(album); } }}      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      <planeGeometry args={[5, 5]} />
      {showFallback ? (
        <meshBasicMaterial key="fallback" color={colour} side={THREE.DoubleSide} />
      ) : (
        <meshBasicMaterial key="texture" map={texture} side={THREE.DoubleSide} />
      )}

      {hovered && !isSelected && (
        <Html position={[0, 3.4, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div className="text-center font-jost whitespace-nowrap">
            <div className="text-white font-playfair text-4xl drop-shadow-lg">
              {album.title}
            </div>
            <div className="text-white/70 text-3xl">{album.artist}</div>
          </div>
        </Html>
      )}

      {isSelected && (
        <Html
          position={[COVER_SIZE + 1, COVER_SIZE/2+0.3, 0]}
          distanceFactor={20}
          style={{ pointerEvents: "auto",
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="font-jost"
            style={{ width: "300px",
              padding: "20px 22px",
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-playfair font-bold" style={{ fontSize: "20px", color: "rgba(255,255,255,0.92)"}}>{album.title}</h2>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.50)" }}>{album.artist} · {album.year}</p>
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "rgba(255,255,255,0.85)", textAlign: "right"}}>{album.rating.toFixed(1)}</h2>
            </div>
            <div
            className="scrollbar-none"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "8px",
              fontSize: "10px",
              overflowY: "scroll",
              WebkitOverflowScrolling: "touch",
              maxHeight: "400px",
            }}>
              {album.review ? (
                <p style={{ lineHeight: "1.65", color: "rgba(255,255,255,0.78)", margin: 0 }}>{album.review}</p>
              ) : (
                <p style={{ fontStyle: "italic", color: "rgba(255,255,255,0.28)", margin: 0 }}>Review coming soon.</p>
              )}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Plankton                                                                  */
/* -------------------------------------------------------------------------- */

function Plankton({ maxDepth }: { maxDepth: number }) {
  const count     = 420;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases    = new Float32Array(count);
    const speeds    = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (rand01(String(i), "px") - 0.5) * 80;
      positions[i * 3 + 1] = -rand01(String(i), "py") * maxDepth;
      positions[i * 3 + 2] = -5 - rand01(String(i), "pz") * 80;
      phases[i] = rand01(String(i), "ph") * Math.PI * 2;
      speeds[i] = 0.08 + rand01(String(i), "sp") * 0.14;
    }
    return { positions, phases, speeds };
  }, [maxDepth]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t    = clock.getElapsedTime();
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      attr.setY(i, positions[i * 3 + 1] + Math.sin(t * speeds[i] + phases[i]) * 2);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={1} color={PLANKTON_COLOUR} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Water Surface                                                    */
/* -------------------------------------------------------------------------- */

function WaterSurface() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  // Rotation: -PI/2 around X flattens the plane to horizontal.
  //            PI/6 around z means the waves move diagonally, less obviously generated.
  // the camera sees in both the above-water and below-water phases.
  return (
    <mesh rotation={[-Math.PI/2, 0, Math.PI/6]} position={[300, -4, -150]} renderOrder={1}>
      <planeGeometry args={[750, 750, 100, 50]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        uniforms={{ uTime: { value: 0 }, uAlpha: { value: 0.80 } }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sky dome                                                                  */
/* -------------------------------------------------------------------------- */

function SkyDome() {
  const { camera } = useThree();
  const meshRef    = useRef<THREE.Mesh>(null);
  const matRef     = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return;
    // Keep dome centred on the camera.
    meshRef.current.position.copy(camera.position);
    // Fade out as the camera descends below water.
    const alpha = THREE.MathUtils.smoothstep(camera.position.y, -6, 2);
    (matRef.current.uniforms.uAlpha as { value: number }).value = alpha;
    meshRef.current.visible = alpha > 0.005;
  });

  return (
    <mesh ref={meshRef} renderOrder={-2}>
      <sphereGeometry args={[100, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={{
          uZenith:  { value: SKY_ZENITH.clone()  },
          uHorizon: { value: SKY_HORIZON.clone() },
          uAlpha:   { value: 1.0 },
        }}
        side={THREE.BackSide}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sun with bloom corona                                                     */
/* -------------------------------------------------------------------------- */

function Sun() {
  const { camera }  = useThree();
  const groupRef    = useRef<THREE.Group>(null);
  const coreMatRef  = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef  = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const alpha = THREE.MathUtils.smoothstep(camera.position.y, -6, 2);
    groupRef.current.visible = alpha > 0.005;
    if (coreMatRef.current) coreMatRef.current.opacity = alpha;
    if (glowMatRef.current) glowMatRef.current.opacity = alpha * 0.13;
  });

  return (
    <group ref={groupRef} position={[0, 0, -370]}>
      {/* Bright core — picked up by the Bloom pass */}
      <mesh>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial ref={coreMatRef} color={SUN_COLOUR} transparent opacity={1} />
      </mesh>
      {/* Soft outer corona */}
      <mesh>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial ref={glowMatRef} color={CORONA_COLOUR} transparent opacity={0.13} depthWrite={false} />
      </mesh>
      {/* Soft outer corona II */}
      <mesh>
        <sphereGeometry args={[16, 16, 16]} />
        <meshBasicMaterial ref={glowMatRef} color={CORONA_COLOUR} transparent opacity={0.13} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cloud puffs (clusters of overlapping spheres)                             */
/* -------------------------------------------------------------------------- */

function CloudPuff({
  ci,
  position,
  scale: s = 1,
}: {
  ci: number;
  position: [number, number, number];
  scale?: number;
}) {
  const { camera } = useThree();
  const groupRef   = useRef<THREE.Group>(null);
  const matsRef    = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const spheres = useMemo(() =>
    Array.from({ length: 9 }, (_, si) => ({
      x:  (rand01(`c${ci}s${si}`, "cx") - 0.5) * 25,
      y:  (rand01(`c${ci}s${si}`, "cy") - 2) * 3,
      z:  (rand01(`c${ci}s${si}`, "cz") - 0.5) * 8,
      r:  3.0 + rand01(`c${ci}s${si}`, "cr") * 4.0,
      op: 0.55 + rand01(`c${ci}s${si}`, "co") * 0.1,
    })),
  [ci]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const alpha = THREE.MathUtils.smoothstep(camera.position.y, -6, 2);
    groupRef.current.visible = alpha > 0.005;
    // Gentle lateral drift unique to each cloud.
    groupRef.current.position.set(
      position[0] + Math.sin(clock.getElapsedTime() * 0.1 + ci * 1.3) * 1.8,
      position[1],
      position[2],
    );
    matsRef.current.forEach((mat, si) => {
      if (mat) mat.opacity = alpha * spheres[si].op;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={s}>
      {spheres.map((sp, si) => (
        <mesh key={si} position={[sp.x, sp.y, sp.z]}>
          <sphereGeometry args={[sp.r, 12, 12]} />
          <meshBasicMaterial
            ref={(m) => { matsRef.current[si] = m; }}
            color={CLOUD_COLOUR}
            transparent
            opacity={sp.op}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

const CLOUD_DEFS: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-55, 38, -25], scale: 1.4 },
  { pos: [ 65, 44, -40], scale: 1.1 },
  { pos: [  5, 50, -65], scale: 1.6 },
  { pos: [-85, 33, -18], scale: 0.9 },
  { pos: [-25, 48, -50], scale: 1.0 },
];

/* -------------------------------------------------------------------------- */
/*  Scroll Indicating Chevrons                                                */
/* -------------------------------------------------------------------------- */

function ScrollChevrons({ progressRef }: { progressRef: RefObject<number> }) {
  // Chevron shape.
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.2,  0.85);
    s.lineTo( 0.0, -1.25);
    s.lineTo( 3.2,  0.85);
    s.lineTo( 1.85, 0.85);
    s.lineTo( 0.0, -0.25);
    s.lineTo(-1.85, 0.85);
    s.closePath();
    return s;
  }, []);

  const groupRef  = useRef<THREE.Group>(null);
  const meshRefs  = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const matRefs   = useRef<(THREE.MeshBasicMaterial | null)[]>([null, null, null]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = progressRef.current;

    // Fade to fully transparent over the first 5 % of scroll.
    const alpha = THREE.MathUtils.clamp(1 - p / 0.05, 0, 1);
    if (groupRef.current) groupRef.current.visible = alpha > 0.005;

    for (let i = 0; i < 3; i++) {
      const mesh = meshRefs.current[i];
      const mat  = matRefs.current[i];
      if (mesh) {
        // Chevron bouncing & spread values set here.
        mesh.position.y = -i * 2.4 + Math.sin(t * 2 + i * 0.25) * 0.50;
      }
      if (mat) {
        // Chevron opacity cascade
        const baseOpacity = 0.1 + 0.5 * ((i + 1) / 3);
        mat.opacity = alpha * baseOpacity;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 13, -5]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => { meshRefs.current[i] = m; }}
        >
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial
            ref={(m) => { matRefs.current[i] = m; }}
            color="lightblue"
            transparent
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  DepthRig                                                                  */
/* -------------------------------------------------------------------------- */

function DepthRig({
  progressRef,
  maxDepth,
}: {
  progressRef: RefObject<number>;
  maxDepth: number;
}) {
  const { scene, camera } = useThree();
  const fogRef = useRef(new THREE.FogExp2(SKY_HORIZON.getHex(), 0.0006));

  // Apply initial camera state (above-water position + downward tilt) before
  // the first frame so there is no visible snap on mount.
  useEffect(() => {
    camera.position.y = ABOVE_WATER_HEIGHT;
    camera.rotation.x = PITCH_ABOVE;
  }, [camera]); // camera reference is stable for the lifetime of the Canvas

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => { scene.fog = null; };
  }, [scene]);

  useFrame((_state, delta) => {
    const p = progressRef.current;

    /* ── Camera Y position ──────────────────────────────────────────── */
    let targetY: number;
    if (p < SURFACE_THRESHOLD) {
      // Above-water descent: progress 0 → SURFACE_THRESHOLD maps height from ABOVE_WATER_HEIGHT to 0.
      targetY = ABOVE_WATER_HEIGHT * (1 - p / SURFACE_THRESHOLD);
    } else {
      // Below-water descent: same total distance as the original.
      const t = (p - SURFACE_THRESHOLD) / (1 - SURFACE_THRESHOLD);
      targetY = -t * maxDepth;
    }
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4);

    /* ── Camera pitch  -----------------------───────────────────────── */
    const camY        = camera.position.y;
    let targetPitch: number;
    if (camY >= 0) {
      const t = THREE.MathUtils.clamp(camY / ABOVE_WATER_HEIGHT, 0, 1);
      targetPitch = THREE.MathUtils.lerp(PITCH_DIVE, PITCH_ABOVE, t);
    } else {
      const t = THREE.MathUtils.clamp(Math.abs(camY) / PITCH_RECOVER_DEPTH, 0, 1);
      targetPitch = THREE.MathUtils.lerp(PITCH_DIVE, 0, t);
    }
    camera.rotation.x += (targetPitch - camera.rotation.x) * Math.min(1, delta * 3.5);

    /* ── Background colour & fog ────────────────────────────────────── */
    if (camY >= 0) {
      // Above water: gradient from horizon to zenith based on height.
      const skyT   = THREE.MathUtils.clamp(camY / ABOVE_WATER_HEIGHT, 0, 1);
      const colour = SKY_HORIZON.clone().lerp(SKY_ZENITH, skyT);
      if (scene.background instanceof THREE.Color) scene.background.copy(colour);
      fogRef.current.color.copy(colour);
      fogRef.current.density = 0.0006; // near-zero above water
    } else {
      // Below water: 3-stop gradient (surface teal → mid-ocean → abyss)
      // with fog density increasing with depth.
      const depthT = THREE.MathUtils.clamp(Math.abs(camY) / maxDepth, 0, 1);
      let colour: THREE.Color;
      if (depthT < 0.35) {
        colour = SURFACE_COLOUR.clone().lerp(MID_OCEAN_COLOUR, depthT / 0.35);
      } else {
        colour = MID_OCEAN_COLOUR.clone().lerp(ABYSS_COLOUR, (depthT - 0.35) / 0.65);
      }
      if (scene.background instanceof THREE.Color) scene.background.copy(colour);
      fogRef.current.color.copy(colour);
      fogRef.current.density = 0.010 + depthT * 0.014; // 0.010 → 0.024
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

function Scene({ albums, progressRef, selectedKey, onAlbumSelect }: {
  albums: Album[];
  progressRef: RefObject<number>;
  selectedKey: string | null;
  onAlbumSelect: (key: string | null) => void;
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

  // Lock scroll container while album is selected
  useEffect(() => {
    const el = document.getElementById("scroll-container") as HTMLElement | null;
    if (!el) return;
    el.style.overflowY = selectedKey ? "hidden" : "scroll";
    return () => { el.style.overflowY = "scroll"; };
  }, [selectedKey]);

  return (
    <>
      {/* ── Camera / fog / colour control ─────────────────────────── */}
      <DepthRig progressRef={progressRef} maxDepth={maxDepth} />

      {/* ── Above-water atmosphere (sky dome + clouds + sun) ──────── */}
      <SkyDome />
      <Sun />
      {CLOUD_DEFS.map((c, i) => (
        <CloudPuff key={i} ci={i} position={c.pos} scale={c.scale} />
      ))}

      {/* ── Scroll hint ───────────────────────────────────────────── */}
      <ScrollChevrons progressRef={progressRef} />

      {/* ── Water surface at y = 0 ────────────────────────────────── */}
      <WaterSurface />

      {/* ── Underwater ────────────────────────────────────────────── */}
      {placed.map((p) => (
        <AlbumMarker
          key={p.album.key}
          placed={p}
          isSelected={p.album.key === selectedKey}
          onSelect={(album) => onAlbumSelect(album.key)}
          onDeselect={() => onAlbumSelect(null)}
        />
      ))}
      {/* <Plankton maxDepth={maxDepth} /> */}

      {/* ── Post-processing ───────────────────────────────────────── */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.4} intensity={0.6} mipmapBlur />
      </EffectComposer>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exported Canvas wrapper                                                   */
/* -------------------------------------------------------------------------- */

export default function DiveScene({
  albums,
  sectionRef,
}: {
  albums: Album[];
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const progressRef = useDiveScroll(sectionRef);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <Canvas
      // Start the camera above the water at y = ABOVE_WATER_HEIGHT.
      // DepthRig will apply the correct pitch on its first frame (before the
      // scene fades in), so there is no visible snap in camera orientation.
      camera={{ position: [0, ABOVE_WATER_HEIGHT, 30], fov: 46, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
      dpr={[1, 1.75]}
    >
      {/* Initial background matches the sky horizon until DepthRig takes over. */}
      <color attach="background" args={[BACKGROUND_COLOUR]} />
      <Suspense fallback={null}>
        <Scene albums={albums} progressRef={progressRef} selectedKey={selectedKey} onAlbumSelect={setSelectedKey} />
      </Suspense>
    </Canvas>
  );
}