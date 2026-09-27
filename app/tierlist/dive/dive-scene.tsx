"use client";

import { useEffect, useMemo, useRef, useState, Suspense, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, wrapEffect } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Album } from "../../data/albums";
import { useDiveScroll } from "./use-dive-scroll";
import { Html } from "@react-three/drei";

/* -------------------------------------------------------------------------- */
/*  Colours                                                                   */
/* -------------------------------------------------------------------------- */

// Background Colour
const BACKGROUND_COLOUR = new THREE.Color("#ffffff")

// OCEAN PALETTE
const SURFACE_COLOUR   = new THREE.Color("#6cb6de");
const SHALLOW_COLOUR   = new THREE.Color("#2f8fae");
const UPPER_OCEAN_COLOUR = new THREE.Color("#124a72")
const MID_OCEAN_COLOUR = new THREE.Color("#092a44");
const DEEP_COLOUR      = new THREE.Color("#001426");
const ABYSS_COLOUR     = new THREE.Color("#000110");

// Sky colours
const SKY_ZENITH  = new THREE.Color("#0b5cb0");
const SKY_HORIZON = new THREE.Color("#6cb6de");
const SKY_BASE    = new THREE.Color("#f3c179");

// Sun colours
const SUN_COLOUR  = new THREE.Color("#fff4bf");
const CORONA_COLOUR  = new THREE.Color("#ffd98a");

// Underwater particulate / shaft colours
const MARINE_SNOW_COLOUR = new THREE.Color("#cfeee6");
const SHAFT_COLOUR       = new THREE.Color("#a8dcf5");


// Cloud colour
const CLOUD_TOP  = new THREE.Color("#ffffff");
const CLOUD_BASE = new THREE.Color("#9fb3c4");

const WATER_DEEP    = new THREE.Color("#08304f");
const WATER_SHALLOW = new THREE.Color("#2f8fa8");
const SUN_DIR       = new THREE.Vector3(-0.35, 0.55, -1.0).normalize();

// Direction sunlight actually travels once it has entered the water, from
// Snell's law at the air/water boundary (n = 1.333). Every shaft is oriented
// along this, so they share the sun's direction rather than leaning at random.
const SHAFT_DIR = (() => {
  const incident = SUN_DIR.clone().negate().normalize();
  const normal   = new THREE.Vector3(0, 1, 0);
  const eta      = 1 / 1.333;
  const cosi     = -normal.dot(incident);
  const k        = 1 - eta * eta * (1 - cosi * cosi);
  return incident
    .multiplyScalar(eta)
    .add(normal.clone().multiplyScalar(eta * cosi - Math.sqrt(k)))
    .normalize();
})();

// Rotation that points a plane's local +Y up the shaft, i.e. back toward the sun.
const SHAFT_QUAT = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 1, 0),
  SHAFT_DIR.clone().negate(),
);

// Album fallback colour
const FALLBACK_COLOUR = "#000000"


/* -------------------------------------------------------------------------- */
/*  Tunables                                                                  */
/* -------------------------------------------------------------------------- */

// const LAYOUT_SEED = "7";
const LAYOUT_SEED = Math.random().toString(36).slice(2);

const COVER_SIZE  = 5;
const EDGE_MARGIN = 1.5;

const DEPTH_SCALE    = 50;
const UNDULATE_RANGE = 0.2;
const DEPTH_OFFSET = UNDULATE_RANGE * DEPTH_SCALE + 15;
const DRIFT_RANGE    = 5;

const HOVER_EASE  = 8;
const HOVER_SCALE = 0.5;
const REST_TILT_X = THREE.MathUtils.degToRad(32);
const REST_TILT_Z = THREE.MathUtils.degToRad(14);

const REFERENCE_HALF_WIDTH   = 20;
const MIN_SEPARATION         = COVER_SIZE * 1.6;
const COLLISION_Y_WINDOW     = 2 * UNDULATE_RANGE * DEPTH_SCALE;
const MAX_PLACEMENT_ATTEMPTS = 64;
const DEFAULT_RATING         = 5;

const SELECTED_DISTANCE = 15;
// Fraction of the visible half-width (at SELECTED_DISTANCE) to shift the
// selected album left by, so the gap to the review panel on the right
// scales with viewport width/aspect instead of staying a fixed world-unit
// offset (which shrank, in screen terms, on wider or narrower screens).
const SELECTED_X_FRACTION = 0.6;
// Hard cap (world units) on that leftward shift, so very wide/ultrawide
// viewports don't push the cover too far left or leave an oversized gap
// to the panel -- the shift grows with the fraction above up to this
// ceiling, then holds steady as the viewport keeps getting wider.
const SELECTED_X_MAX_SHIFT = 2;
const SELECTED_Y_OFFSET = 0;
// Minimum on-screen gap (px) enforced between the selected cover's right
// edge and the review panel, computed live from the cover's actual
// projected screen position each frame (see PANEL_GAP_PX usage below) --
// this replaces guessing the panel's width purely from viewport units,
// which can't account for the cover's real projected size/position.
const PANEL_GAP_PX = 32;

// Below this canvas width, the side-by-side layout gets awkward (the cover
// and the review panel have no room to sit next to each other without overlapping
const STACKED_LAYOUT_MAX_WIDTH = 768;
// Fraction of the visible half-height (at SELECTED_DISTANCE) to raise the
// selected album by in stacked mode, clearing room below it for the panel.
const STACKED_Y_FRACTION = 0.5;

// Album cover distance
const STACKED_DISTANCE = 20;

/* -------------------------------------------------------------------------- */
/*  Water/Surface Tunables                                                    */
/* -------------------------------------------------------------------------- */

// World-Y of the camera when scroll progress = 0 (above the surface).
const ABOVE_WATER_HEIGHT = 5;

// offset water from level 0
const WATER_LEVEL_OFFSET = -4;

// Fraction of total scroll progress consumed by the above-water descent.
const SURFACE_THRESHOLD = 0.1;

/* -------------------------------------------------------------------------- */
/*  Camera Pitch Tunables                                                     */
/* -------------------------------------------------------------------------- */

// Camera Pitch Angles
const PITCH_ABOVE = 0.2;    // high above the water, looking out at the sky
const PITCH_DIVE  = -0.55;  // pitched down into the waves, and held through the plunge
const PITCH_LEVEL = 0.0;    // settled horizontal for the descent into the deep

// Depth below the wave plane at which the camera starts levelling off, and the
// distance it takes to get there. A horizontal camera sees ~23 degrees above
// its axis, so the surface re-enters frame at roughly 2.4x the depth below it;
// holding until ~70 keeps that beyond the reach of the underwater fog.
const PITCH_HOLD_DEPTH    = 70;
const PITCH_RECOVER_SPAN  = 45;


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
  uniform vec3  uBase;
  uniform vec3  uSunDir;
  uniform vec3  uSunColour;
  uniform float uAlpha;
  void main() {
    float t = clamp(vWorldNormal.y * 0.5 + 0.5, 0.0, 1.0);
    // Warm band low down, pale haze at the horizon, deeper blue overhead.
    vec3 col = t < 0.5
      ? mix(uBase, uHorizon, smoothstep(0.30, 0.50, t))
      : mix(uHorizon, uZenith, pow(smoothstep(0.50, 1.00, t), 0.85));

    // Warm halo around the sun so the sky isn't a flat ramp.
    float halo = pow(max(dot(normalize(vWorldNormal), normalize(uSunDir)), 0.0), 7.0);
    col += uSunColour * halo * 0.20;

    gl_FragColor = vec4(col, uAlpha);
  }
`;

// Animated water surface plane (horizontal, DoubleSide).
// The mesh is rotated -PI/2 around X, so local XY → world XZ;
// local Z displacement → world Y (wave height).
const WATER_VERT = /* glsl */`
  uniform float uTime;
  varying vec3  vWorldPos;
  varying vec3  vWorldNormal;
  varying float vSteep;
  varying float vElev;
  #include <fog_pars_vertex>

  // One directional sine wave plus its analytic slope, so the surface carries a
  // real normal instead of being coloured by height alone.
  float wave(vec2 p, vec2 dir, float amp, float freq, float speed, float t, inout vec2 slope) {
    vec2  d     = normalize(dir);
    float phase = dot(d, p) * freq + t * speed;
    slope += d * (amp * freq * cos(phase));
    return amp * sin(phase);
  }

  void main() {
    vec3  p     = position;
    vec2  slope = vec2(0.0);
    float h     = 0.0;

    // Long swell down to fine ripple. Non-harmonic frequencies and spread
    // directions stop the pattern from visibly repeating.
    h += wave(p.xy, vec2( 1.00,  0.15), 1.30, 0.045, 0.32, uTime, slope);
    h += wave(p.xy, vec2( 0.70, -0.72), 0.80, 0.110, 0.55, uTime, slope);
    h += wave(p.xy, vec2(-0.35,  0.94), 0.55, 0.190, 0.78, uTime, slope);
    h += wave(p.xy, vec2( 0.92,  0.39), 0.30, 0.330, 1.05, uTime, slope);
    h += wave(p.xy, vec2(-0.80, -0.60), 0.16, 0.620, 1.45, uTime, slope);
    h += wave(p.xy, vec2( 0.20, -0.98), 0.09, 1.050, 1.95, uTime, slope);

    p.z  += h;
    vElev = h;

    vec3 nLocal  = normalize(vec3(-slope.x, -slope.y, 1.0));
    vWorldNormal = normalize((modelMatrix * vec4(nLocal, 0.0)).xyz);
    vSteep       = length(slope);
    vWorldPos    = (modelMatrix * vec4(p, 1.0)).xyz;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const WATER_FRAG = /* glsl */`
  uniform float uAlpha;
  uniform vec3  uSunDir;
  uniform vec3  uSunColour;
  uniform vec3  uDeep;
  uniform vec3  uShallow;
  uniform vec3  uSky;
  varying vec3  vWorldPos;
  varying vec3  vWorldNormal;
  varying float vSteep;
  varying float vElev;
  #include <fog_pars_fragment>

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    if (dot(N, V) < 0.0) N = -N;
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);

    vec3  col;
    float alpha;

    if (gl_FrontFacing) {
      float lift = clamp(vElev * 0.30 + 0.5, 0.0, 1.0);
      vec3  body = mix(uDeep, uShallow, lift);

      // Grazing angles reflect sky, steep angles show the water body.
      float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
      fres = mix(0.03, 1.0, fres);
      col = mix(body, uSky, fres * 0.75);

      // Tight glint lobe, then a wider sheen.
      col += uSunColour * pow(max(dot(N, H), 0.0), 220.0) * 1.9;
      col += uSunColour * pow(max(dot(N, H), 0.0), 18.0)  * 0.16;

      float steep = clamp(vSteep * 2.4, 0.0, 1.0);
      float foam  = smoothstep(0.55, 1.05, vElev * 0.42 + steep * 0.75);
      col = mix(col, vec3(0.92, 0.97, 1.0), foam * 0.55);
      alpha = uAlpha;
    } else {
      // From below, past the critical angle the surface mirrors the dark
      // water; only a cone overhead (Snell's window) lets the sky through.
      float facing = clamp(dot(N, V), 0.0, 1.0);
      float window = smoothstep(0.30, 0.92, facing);

      col  = mix(uDeep * 0.45, mix(uShallow, uSky, 0.65), window);
      col += uSunColour * pow(max(dot(N, H), 0.0), 60.0)  * window * 0.9;
      col += uSunColour * pow(max(dot(N, H), 0.0), 400.0) * 0.5;

      float seam = smoothstep(0.18, 0.0, abs(vSteep - 0.16));
      col += uSky * seam * window * 0.30;
      alpha = uAlpha * (0.55 + 0.45 * window);
    }

    gl_FragColor = vec4(col, alpha);
    #include <fog_fragment>
  }
`;

// Camera-facing cloud billboard with procedural fbm density.
const CLOUD_VERT = /* glsl */`
  uniform vec2 uSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * uSize;
    gl_Position = projectionMatrix * mv;
  }
`;

const CLOUD_FRAG = /* glsl */`
  uniform vec3  uTop;
  uniform vec3  uBase;
  uniform float uAlpha;
  uniform float uTime;
  uniform float uSeed;
  varying vec2  vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2  c    = vUv - 0.5;
    float r    = length(c * vec2(1.0, 2.1));   // wide cumulus, not a disc
    float mask = smoothstep(0.52, 0.06, r);

    float n = fbm(vUv * 3.4 + vec2(uSeed, uSeed * 0.63) + uTime * 0.010);
    float d = smoothstep(0.24, 0.78, mask * n * 1.35);
    if (d <= 0.002) discard;

    float lit = smoothstep(-0.30, 0.34, c.y);  // lit crown, shaded underside
    vec3  col = mix(uBase, uTop, lit);

    gl_FragColor = vec4(col, d * uAlpha);
  }
`;

// Shared full-screen-quad vertex stage for UV-driven effects.
// Soft billboard sun: bright core into a wide falloff, instead of hard spheres.
const SUN_FRAG = /* glsl */`
  uniform vec3  uCore;
  uniform vec3  uGlow;
  uniform float uOpacity;
  varying vec2  vUv;

  void main() {
    float d    = length(vUv - 0.5) * 2.0;
    float core = smoothstep(0.26, 0.00, d);
    float disc = smoothstep(0.30, 0.24, d);
    float halo = pow(smoothstep(1.0, 0.0, d), 3.2);

    vec3  col = uCore * max(core, disc) + uGlow * halo * 0.6;
    float a   = clamp(max(disc, core) + halo * 0.45, 0.0, 1.0) * uOpacity;
    if (a <= 0.002) discard;
    gl_FragColor = vec4(col, a);
  }
`;

const UV_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Volumetric-looking light shaft hanging from the surface.
const SHAFT_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uColour;
  uniform float uSeed;
  varying vec2  vUv;

  void main() {
    // Shafts narrow with depth and wander slightly, so their edges are not
    // ruler-straight parallel lines.
    float taper = mix(0.42, 1.0, vUv.y);
    float wob   = sin(vUv.y *  5.0 + uSeed) * 0.055
                + sin(vUv.y * 11.0 - uTime * 0.25 + uSeed) * 0.028;

    float across = abs((vUv.x - 0.5 + wob) * 2.0) / taper;
    float edge   = pow(smoothstep(1.0, 0.0, across), 2.6);

    float fade  = smoothstep(0.0, 0.70, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
    float flick = 0.70 + 0.30 * sin(uTime * 0.6 + uSeed + vUv.y * 2.6);

    float a = edge * fade * flick * uOpacity;
    if (a <= 0.002) discard;
    gl_FragColor = vec4(uColour, a);
  }
`;

// Marine snow: drifting organic debris. Drift is done on the GPU so the
// particle buffer never has to be rewritten from JS each frame.
const SNOW_VERT = /* glsl */`
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSpan;
  uniform float uScale;
  varying float vFade;

  void main() {
    vec3  p     = position;
    float speed = 0.35 + fract(aSeed * 7.13) * 0.55;
    p.y -= mod(uTime * speed + aSeed * uSpan, uSpan);
    p.x += sin(uTime * 0.28 + aSeed * 12.0) * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * (uScale / max(-mv.z, 0.001));
    vFade = clamp(1.0 - (-mv.z) / 150.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const SNOW_FRAG = /* glsl */`
  uniform vec3  uColour;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    // Round and soft. Default point sprites are hard squares, which is what
    // made the previous particles read as dirt on the lens.
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d);
    a = a * a * vFade * uOpacity;
    if (a <= 0.002) discard;
    gl_FragColor = vec4(uColour, a);
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

    albums.filter(a => a.rating !== -1).forEach((album) => {
      const baseY = -safeRating(album) * DEPTH_SCALE - DEPTH_OFFSET;

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

  useFrame(({ clock, camera, size }, delta) => {
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
      const stacked = size.width < STACKED_LAYOUT_MAX_WIDTH;
      const selDistance = stacked ? STACKED_DISTANCE : SELECTED_DISTANCE;

      camera.getWorldDirection(camDir.current);
      selectedPos.current.copy(camera.position).addScaledVector(camDir.current, selDistance);

      if (stacked) {
        // Stacked layout: stay horizontally centred, move up to leave room for the review panel underneath.
        const selHalfHeight = selDistance * Math.tan(verticalHalfAngle);
        selectedPos.current.y += SELECTED_Y_OFFSET + selHalfHeight * STACKED_Y_FRACTION;
      } else {
        // Side-by-side layout: shift left to clear space for the panel on the right,
        // capped so wide viewports don't push it too far or leave too big a gap.
        selectedPos.current.y += SELECTED_Y_OFFSET;
        const selHalfWidth = selDistance * Math.tan(verticalHalfAngle) * perspCam.aspect;
        const shift = Math.min(selHalfWidth * SELECTED_X_FRACTION, SELECTED_X_MAX_SHIFT);
        selectedPos.current.x += -shift;

        // Project the cover's actual right edge to screen space (rather than
        // guessing from viewport units alone, which can't account for the
        // camera's aspect/fov) and publish the panel's live max-width as a
        // CSS var, so the panel can never grow wide enough to overlap it.
        const coverRightWorldX = selectedPos.current.x + COVER_SIZE / 2;
        const coverRightFrac   = coverRightWorldX / selHalfWidth; // roughly -1..1
        const coverRightVw     = 0.5 + coverRightFrac / 2;        // 0..1 from the left edge
        const rightMarginPx    = size.width >= 1280 ? 192 : size.width >= 1024 ? 128 : 48; // xl/lg/md px-* padding
        const availablePx      = (1 - coverRightVw) * size.width - rightMarginPx - PANEL_GAP_PX;
        document.documentElement.style.setProperty("--panel-max-w", `${Math.max(160, availablePx)}px`);
      }
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

    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Water Surface                                                    */
/* -------------------------------------------------------------------------- */

function WaterSurface() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Merged with the fog uniforms, and the material opts in with `fog`.
  // A ShaderMaterial is not fogged automatically, which is why the surface
  // used to stay fully drawn however far below it the camera got.
  const uniforms = useMemo(() => THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime:      { value: 0 },
      uAlpha:     { value: 0.95 },
      uSunDir:    { value: SUN_DIR },
      uSunColour: { value: SUN_COLOUR },
      uDeep:      { value: WATER_DEEP },
      uShallow:   { value: WATER_SHALLOW },
      uSky:       { value: SKY_HORIZON },
    },
  ]), []);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  // 320 segments keeps the finest ripple (~6 unit wavelength) above two
  // vertices per wave; the old 100x50 grid was far too coarse to shade.
  return (
    <mesh rotation={[-Math.PI/2, 0, Math.PI/6]} position={[200, WATER_LEVEL_OFFSET, -200]} renderOrder={1}>
      <planeGeometry args={[750, 750, 320, 320]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        uniforms={uniforms}
        transparent
        fog
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
          uBase:      { value: SKY_BASE.clone() },
          uSunDir:    { value: SUN_DIR },
          uSunColour: { value: SUN_COLOUR },
          uAlpha:     { value: 1.0 },
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
  const { camera } = useThree();
  const meshRef    = useRef<THREE.Mesh>(null);
  const matRef     = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uSize:    { value: new THREE.Vector2(120, 120) },
    uCore:    { value: SUN_COLOUR },
    uGlow:    { value: CORONA_COLOUR },
    uOpacity: { value: 1 },
  }), []);

  const position = useMemo(
    () => SUN_DIR.clone().multiplyScalar(340).toArray() as [number, number, number],
    [],
  );

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return;
    const alpha = THREE.MathUtils.smoothstep(camera.position.y, -6, 2);
    meshRef.current.visible = alpha > 0.005;
    matRef.current.uniforms.uOpacity.value = alpha;
  });

  // A billboard with a soft falloff rather than stacked spheres, which read as
  // a hard pasted-on disc.
  return (
    <mesh ref={meshRef} position={position} frustumCulled={false} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CLOUD_VERT}
        fragmentShader={SUN_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
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
  const matsRef    = useRef<(THREE.ShaderMaterial | null)[]>([]);

  // Four overlapping billboards per cloud. Each carries its own fbm seed, so
  // the cluster reads as one mass rather than repeated stamps.
  const puffs = useMemo(() =>
    Array.from({ length: 4 }, (_, bi) => ({
      x:    (rand01(`c${ci}b${bi}`, "bx") - 0.5) * 38,
      y:    (rand01(`c${ci}b${bi}`, "by") - 0.5) * 8,
      z:    (rand01(`c${ci}b${bi}`, "bz") - 0.5) * 12,
      size: 34 + rand01(`c${ci}b${bi}`, "bs") * 26,
      seed: rand01(`c${ci}b${bi}`, "bd") * 40,
      op:   0.72 + rand01(`c${ci}b${bi}`, "bo") * 0.24,
    })),
  [ci]);

  const uniforms = useMemo(() => puffs.map((pf) => ({
    uSize:  { value: new THREE.Vector2(pf.size, pf.size) },
    uTop:   { value: CLOUD_TOP },
    uBase:  { value: CLOUD_BASE },
    uAlpha: { value: pf.op },
    uTime:  { value: 0 },
    uSeed:  { value: pf.seed },
  })), [puffs]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const alpha = THREE.MathUtils.smoothstep(camera.position.y, -6, 2);
    groupRef.current.visible = alpha > 0.005;

    const t = clock.getElapsedTime();
    groupRef.current.position.set(
      position[0] + Math.sin(t * 0.1 + ci * 1.3) * 1.8,
      position[1],
      position[2],
    );

    matsRef.current.forEach((mat, bi) => {
      if (!mat) return;
      mat.uniforms.uAlpha.value = alpha * puffs[bi].op;
      mat.uniforms.uTime.value  = t;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={s}>
      {puffs.map((pf, bi) => (
        <mesh key={bi} position={[pf.x, pf.y, pf.z]} frustumCulled={false} renderOrder={2}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={(m) => { matsRef.current[bi] = m as THREE.ShaderMaterial; }}
            vertexShader={CLOUD_VERT}
            fragmentShader={CLOUD_FRAG}
            uniforms={uniforms[bi]}
            transparent
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
/*  DepthRig                                                                  */
/* -------------------------------------------------------------------------- */
/*  Light shafts                                                              */
/* -------------------------------------------------------------------------- */

function LightShafts() {
  const { camera }  = useThree();
  const groupRef    = useRef<THREE.Group>(null);
  const matsRef     = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const shafts = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      x:    (rand01(`sh${i}`, "x") - 0.5) * 110,
      z:    -40 - rand01(`sh${i}`, "z") * 90,
      w:    6 + rand01(`sh${i}`, "w") * 12,
      h:    95 + rand01(`sh${i}`, "h") * 75,
      op:   0.09 + rand01(`sh${i}`, "o") * 0.10,
      seed: rand01(`sh${i}`, "s") * 10,
    })),
  []);

  const uniforms = useMemo(() => shafts.map((sh) => ({
    uTime:    { value: 0 },
    uOpacity: { value: sh.op },
    uColour:  { value: SHAFT_COLOUR },
    uSeed:    { value: sh.seed },
  })), [shafts]);

  useFrame(({ clock }) => {
    // Only meaningful once the camera is under the surface.
    const alpha = THREE.MathUtils.smoothstep(-camera.position.y, 0, 10);
    if (groupRef.current) groupRef.current.visible = alpha > 0.01;

    const t = clock.getElapsedTime();
    matsRef.current.forEach((m, i) => {
      if (!m) return;
      m.uniforms.uTime.value    = t;
      m.uniforms.uOpacity.value = shafts[i].op * alpha;
    });
  });

  return (
    <group ref={groupRef}>
      {shafts.map((sh, i) => (
        <mesh
          key={i}
          position={[sh.x, WATER_LEVEL_OFFSET + SHAFT_DIR.y * (sh.h / 2), sh.z]}
          quaternion={SHAFT_QUAT}
          frustumCulled={false}
          renderOrder={3}
        >
          <planeGeometry args={[sh.w, sh.h]} />
          <shaderMaterial
            ref={(m) => { matsRef.current[i] = m as THREE.ShaderMaterial; }}
            vertexShader={UV_VERT}
            fragmentShader={SHAFT_FRAG}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Marine snow                                                               */
/* -------------------------------------------------------------------------- */

function MarineSnow({ maxDepth }: { maxDepth: number }) {
  const COUNT = 900;
  const { camera } = useThree();
  const matRef     = useRef<THREE.ShaderMaterial>(null);

  const span = maxDepth + 40;

  const { positions, sizes, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);
    const seeds     = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (rand01(String(i), "sx") - 0.5) * 130;
      positions[i * 3 + 1] = WATER_LEVEL_OFFSET - rand01(String(i), "sy") * span;
      positions[i * 3 + 2] = 25 - rand01(String(i), "sz") * 130;
      sizes[i]             = 0.6 + rand01(String(i), "ss") * 2.3;
      seeds[i]             = rand01(String(i), "sd");
    }
    return { positions, sizes, seeds };
  }, [span]);

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uSpan:    { value: span },
    uScale:   { value: 170 },
    uColour:  { value: MARINE_SNOW_COLOUR },
    uOpacity: { value: 0 },
  }), [span]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const alpha = THREE.MathUtils.smoothstep(-camera.position.y, 0, 12);
    matRef.current.uniforms.uTime.value    = clock.getElapsedTime();
    matRef.current.uniforms.uOpacity.value = alpha * 0.8;
  });

  return (
    <points renderOrder={4}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed"    args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={SNOW_VERT}
        fragmentShader={SNOW_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

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
      // Hold the dive angle until the wave plane is well out of frame, then
      // ease back to horizontal for the rest of the descent.
      const belowSurface = Math.max(0, WATER_LEVEL_OFFSET - camY);
      const t = THREE.MathUtils.smoothstep(
        belowSurface,
        PITCH_HOLD_DEPTH,
        PITCH_HOLD_DEPTH + PITCH_RECOVER_SPAN,
      );
      targetPitch = THREE.MathUtils.lerp(PITCH_DIVE, PITCH_LEVEL, t);
    }
    camera.rotation.x += (targetPitch - camera.rotation.x) * Math.min(1, delta * 3.5);

    /* -- Background colour & fog -------------------------------------- */
    const skyT        = THREE.MathUtils.clamp(camY / ABOVE_WATER_HEIGHT, 0, 1);
    const aboveColour = SKY_HORIZON.clone().lerp(SKY_ZENITH, skyT);

    const depthT = THREE.MathUtils.clamp(Math.max(0, -camY) / maxDepth, 0, 1);
    const oceanStops: [number, THREE.Color][] = [
      [0,    SURFACE_COLOUR],
      [0.2, SHALLOW_COLOUR],
      [0.4, UPPER_OCEAN_COLOUR],
      [0.6,  MID_OCEAN_COLOUR],
      [0.8, DEEP_COLOUR],
      [1,    ABYSS_COLOUR],
    ];
    let belowColour = ABYSS_COLOUR;
    for (let i = 0; i < oceanStops.length - 1; i++) {
      const [t0, c0] = oceanStops[i];
      const [t1, c1] = oceanStops[i + 1];
      if (depthT <= t1 || i === oceanStops.length - 2) {
        belowColour = c0.clone().lerp(c1, THREE.MathUtils.smoothstep(depthT, t0, t1));
        break;
      }
    }

    // Cross-fade between the underwater curve and the sky curve across a
    // short band straddling the waterline, instead of hard-switching at camY === 0.
    const surfaceBlend = THREE.MathUtils.smoothstep(camY, -8, 6);
    const colour        = belowColour.clone().lerp(aboveColour, surfaceBlend);
    if (scene.background instanceof THREE.Color) scene.background.copy(colour);
    fogRef.current.color.copy(colour);
    fogRef.current.density = THREE.MathUtils.lerp(0.010 + depthT * 0.01, 0.0006, surfaceBlend);
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
    () => Math.max(...albums.filter(a => a.rating !== -1).map((a) => safeRating(a)), 1),
    [albums]
  );
  const maxDepth = maxRating * DEPTH_SCALE + UNDULATE_RANGE * DEPTH_SCALE + DEPTH_OFFSET + WATER_LEVEL_OFFSET;

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


      {/* ── Water surface at y = 0 ────────────────────────────────── */}
      <WaterSurface />

      {/* ── Underwater ────────────────────────────────────────────── */}
      <LightShafts />
      <MarineSnow maxDepth={maxDepth} />
      {placed.map((p) => (
        <AlbumMarker
          key={p.album.key}
          placed={p}
          isSelected={p.album.key === selectedKey}
          onSelect={(album) => onAlbumSelect(album.key)}
          onDeselect={() => onAlbumSelect(null)}
        />
      ))}

      {/* ── Post-processing ───────────────────────────────────────── */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.25} intensity={0.3} mipmapBlur />
      </EffectComposer>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Review panel (screen space, not attached to the 3D cover)                 */
/* -------------------------------------------------------------------------- */

function ReviewPanel({ album, onClose }: { album: Album | null; onClose: () => void }) {
  // Drives the reveal transition: the panel mounts blurry-text / clear-background,
  // then a tick later flips to clear-text / blurred-background so it animates in
  // on its own as soon as an album is selected, rather than waiting for a hover.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!album) {
      setRevealed(false);
      return;
    }
    setRevealed(false);
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [album?.key]);

  return (
    <div
      className={`pointer-events-none absolute z-20 flex transition-opacity duration-300 ease-out
        inset-x-0 top-[48vh] bottom-6 justify-center items-start px-4
        md:inset-x-auto md:left-auto md:top-10 md:bottom-10 md:right-0 md:px-12 md:pt-48 lg:px-32 xl:px-48
        ${album ? "opacity-100" : "opacity-0"}`}
    >
      {album && (
        <div className="pointer-events-auto relative flex max-h-[calc(52vh-1.5rem)] w-[min(28rem,calc(100vw-2rem))] md:max-h-[calc(100vh-30rem)] md:w-[min(36rem,var(--panel-max-w,36rem))] flex-col">
          {/* Frosted background layer: this is what actually blurs the scene
              behind the card. It's masked to fade out toward the edges so the
              blur feathers into its surroundings, and kept separate from the
              text below so the fade never touches the text's own opacity. */}
          <div
            className={`card-fade-mask absolute inset-0 rounded-3xl bg-black/5 transition-[backdrop-filter] duration-1000 ease-out ${
              revealed ? "backdrop-blur-xs" : "backdrop-blur-none"
            }`}
          />

          {/* Content layer: fades from blurry to sharp on its own, independent
              of the background layer's blur/fade above. */}
          <div
            className={`relative z-10 flex min-h-0 flex-1 flex-col p-8 font-jost transition-[filter] duration-1000 ease-out ${
              revealed ? "blur-none" : "blur-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-12">
              <div className="min-w-0">
                <h2 className="font-playfair text-4xl font-bold text-white/90">{album.title}</h2>
                <p className="pt-4 text-xl text-white/50">{album.artist} · {album.year}</p>
              </div>
              <div className="flex shrink-0 items-start gap-4">
                <span className="text-4xl font-semibold leading-none text-white/85 pr-4">{album.rating.toFixed(1)}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close review"
                  className="mt-1 text-2xl leading-none text-white/40 transition-colors hover:text-white/80"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="review-scroll mt-3 min-h-0 flex-1 overflow-y-auto border-t border-white/10 pr-5 pt-3">
              {album.review ? (
                album.review.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="mb-3 text-base leading-relaxed text-white/75">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-sm italic text-white/30">Review coming soon.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .card-fade-mask {
          -webkit-mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
          mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
        }
        .review-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
        }
        .review-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .review-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.25);
          border-radius: 2px;
        }
      `}</style>
    </div>
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

  const selectedAlbum = albums.find((a) => a.key === selectedKey) ?? null;

  return (
    <div className="relative h-full w-full">
    <Canvas
      // Start the camera above the water at y = ABOVE_WATER_HEIGHT.
      // DepthRig will apply the correct pitch on its first frame (before the
      // scene fades in), so there is no visible snap in camera orientation.
      camera={{ position: [0, ABOVE_WATER_HEIGHT, 30], fov: 46, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={[BACKGROUND_COLOUR]} />
      <Suspense fallback={null}>
        <Scene albums={albums} progressRef={progressRef} selectedKey={selectedKey} onAlbumSelect={setSelectedKey} />
      </Suspense>
    </Canvas>
    <ReviewPanel album={selectedAlbum} onClose={() => setSelectedKey(null)} />
    </div>
  );
}