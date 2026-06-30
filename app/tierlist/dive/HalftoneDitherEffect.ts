// HalftoneDitherEffect.ts
// Drop this alongside dive-scene.tsx — use exactly like BayerDitherEffect:
//
//   import { wrapEffect } from "@react-three/postprocessing";
//   import { HalftoneDitherEffect } from "./HalftoneDitherEffect";
//
//   const HalftoneDither = wrapEffect(HalftoneDitherEffect);
//
//   <EffectComposer>
//     <Bloom ... />
//     <HalftoneDither strength={1.0} levels={8} cellSize={6} />
//   </EffectComposer>
//
// Parameters:
//   cellSize  – diameter of each halftone dot in pixels. 4 = fine, 12 = coarse.
//   levels    – colour quantisation steps. 2 = stark 1-bit, 16 = subtle.
//   strength  – 0 = no dithering, 1 = full halftone. Blend in gradually.

import { Effect, BlendFunction } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = /* glsl */ `
  uniform float uStrength;
  uniform float uLevels;
  uniform float uCellSize;

  // Rotation matrix for angle a (radians).
  mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  // Distance from pixel fc to its nearest cell centre in a grid of size cells
  // rotated by angle a, normalised to [0, 1].
  // 0 = pixel is exactly at a dot centre.
  // 1 = pixel is as far from a centre as possible (corner of the cell).
  float cellDist(vec2 fc, float size, float a) {
    vec2 cell = fract(rot2(a) * fc / size) - 0.5; // [-0.5, 0.5]^2
    // Max distance inside a [-0.5, 0.5]^2 square is sqrt(0.5) ≈ 0.7071.
    return min(length(cell) / 0.7071, 1.0);
  }

  // Quantise a single channel to uLevels steps, using t as the dither
  // threshold (halftone distance) blended by uStrength.
  //   t = 0   → pixel is at a dot centre → always rounds up (dot always lit)
  //   t = 1   → pixel is at cell corner  → never rounds up (stays dark)
  // This produces dots that grow from centre outward as the value increases,
  // which is the classic halftone behaviour.
  float ditherChannel(float v, float t) {
    float n         = uLevels;
    float scaled    = v * (n - 1.0);
    float base      = floor(scaled);
    float frac      = fract(scaled);
    // At strength 0, threshold is always 0.5 (unbiased rounding = no dither).
    float threshold = mix(0.5, t, uStrength);
    return clamp((base + (frac > threshold ? 1.0 : 0.0)) / (n - 1.0), 0.0, 1.0);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 fc = gl_FragCoord.xy;

    // Rotate R, G, B grids by different angles — the classic CMYK halftone
    // press angles (15°, 45°, 75°) that minimise moiré between channels.
    float tr = cellDist(fc, uCellSize, radians(15.0));
    float tg = cellDist(fc, uCellSize, radians(45.0));
    float tb = cellDist(fc, uCellSize, radians(75.0));

    outputColor = vec4(
      ditherChannel(inputColor.r, tr),
      ditherChannel(inputColor.g, tg),
      ditherChannel(inputColor.b, tb),
      inputColor.a
    );
  }
`;

export class HalftoneDitherEffect extends Effect {
  constructor({
    strength = 1.0,
    levels   = 8,
    cellSize = 6.0,
  }: {
    strength?: number;
    levels?:   number;
    cellSize?: number;
  } = {}) {
    super("HalftoneDitherEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform<number>>([
        ["uStrength", new Uniform(strength)],
        ["uLevels",   new Uniform(levels)],
        ["uCellSize", new Uniform(cellSize)],
      ]),
    });
  }

  get strength()  { return this.uniforms.get("uStrength")!.value; }
  set strength(v: number) { this.uniforms.get("uStrength")!.value = v; }

  get levels()    { return this.uniforms.get("uLevels")!.value; }
  set levels(v: number)   { this.uniforms.get("uLevels")!.value = v; }

  get cellSize()  { return this.uniforms.get("uCellSize")!.value; }
  set cellSize(v: number) { this.uniforms.get("uCellSize")!.value = v; }
}
