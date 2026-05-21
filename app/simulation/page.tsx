'use client'

import { useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------
interface Palette {
  background: string
  fog: string
  steps: string[]
}

const PALETTES: Palette[] = [
  {
    // purple back, green steps
    background: '#231942',
    fog: '#231942',
    steps: ['#395E66', '#387D7A', '#32936F', '#26A96C', '#2BC016'],
  },
  {
    // black back, grey steps
    background: '#0a0a0a',
    fog: '#0a0a0a',
    steps: ['#484848', '#4f4f4f', '#565656', '#5d5d5d', '#646464'],
  },
  {
    // pink back, pink/white steps
    background: '#9F84BD',
    fog: '#9F84BD',
    steps: ['#C09BD8', '#EBC3DB', '#EDE3E9', '#E6E4CE'],
  },
  // {
  //   // red back, blue steps
  //   background: '#CD4631',
  //   fog: '#CD4631',
  //   steps: ['#1E555C', '#125E8A', '#197BBD'],
  // },
  // {
  //   //
  //   background: '',
  //   fog: '',
  //   steps: [],
  // },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FOG_DISTANCE = 0.005

const STEP_WIDTH = 8
const STEP_DEPTH = 8
const STEP_HEIGHT = 1
const STEPS_PER_SEGMENT = 1
const NUM_SEGMENTS = 200
const NUM_STAIRCASES = 30

const SPREAD = 0
const SINE_FREQ = 1
const BIAS_STRENGTH = 0.15

const DIRECTIONS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Step {
  position: [number, number, number]
  colour: string
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CameraRig() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    const radius = 200
    camera.position.x = Math.sin(t * 0.5) * radius
    camera.position.z = Math.cos(t * 0.5) * radius
    camera.position.y = 0
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Staircase({ originX, originZ, palette }: { originX: number; originZ: number; palette: Palette }) {
  const steps = useMemo(() => {
    const result: Step[] = []

    let x = originX, y = 0, z = originZ
    let prevDirIndex = -1

    for (let s = 0; s < NUM_SEGMENTS; s++) {
      const sine = Math.sin((s / NUM_SEGMENTS) * Math.PI * 2 * SINE_FREQ)
      const outwardsMovement = sine > 0

      const dx_current = x
      const dz_current = z
      const distFromOrigin = Math.sqrt(dx_current * dx_current + dz_current * dz_current) || 1

      const scores = DIRECTIONS.map(([dx, , dz], idx) => {
        if (idx === (prevDirIndex ^ 1)) return -Infinity
        const dot = (dx * dx_current + dz * dz_current) / distFromOrigin
        const biasScore = outwardsMovement ? dot : -dot
        return biasScore * BIAS_STRENGTH + Math.random() * (1 - BIAS_STRENGTH)
      })

      const dirIndex = scores.indexOf(Math.max(...scores))
      prevDirIndex = dirIndex

      const [dx, , dz] = DIRECTIONS[dirIndex]
      const colour = palette.steps[Math.floor(Math.random() * palette.steps.length)]

      for (let i = 0; i < STEPS_PER_SEGMENT; i++) {
        result.push({ position: [x, y, z], colour })
        x += dx * STEP_WIDTH
        y += STEP_HEIGHT
        z += dz * STEP_DEPTH
      }
    }

    return result
  }, [originX, originZ, palette])

  return (
    <group position={[0, -NUM_SEGMENTS * STEP_HEIGHT / 2, 0]}>
      {steps.map((step, i) => (
        <mesh key={i} position={step.position} castShadow receiveShadow>
          <boxGeometry args={[STEP_WIDTH, STEP_HEIGHT, STEP_DEPTH]} />
          <meshLambertMaterial color={step.colour} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ palette }: { palette: Palette }) {
  const origins = useMemo(() =>
    Array.from({ length: NUM_STAIRCASES }, () => ({
      x: (Math.random() - 0.5) * SPREAD,
      z: (Math.random() - 0.5) * SPREAD,
    }))
  , [])

  return (
    <>
      <fogExp2 attach="fog" args={[palette.fog, FOG_DISTANCE]} />

      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
      <directionalLight position={[-10, 5, -10]} intensity={0.4} />

      <CameraRig />

      {origins.map((o, i) => (
        <Staircase key={i} originX={o.x} originZ={o.z} palette={palette} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StaircasesPage() {
  const [palette, setPalette] = useState<Palette | null>(null)

  useEffect(() => {
    setPalette(PALETTES[Math.floor(Math.random() * PALETTES.length)])
  }, [])

  if (!palette) return null

  return (
    <div className="w-full h-screen" style={{ background: palette.background }}>
      <Canvas
        camera={{ fov: 75 }}
        shadows
        gl={{ antialias: false }}
        scene={{ background: new THREE.Color(palette.background) }}
      >
        <Scene palette={palette} />
      </Canvas>
    </div>
  )
}