'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Environment,
    Lightformer,
    MeshTransmissionMaterial,
    OrbitControls,
    useGLTF,
} from '@react-three/drei';

export const MODEL_PATH = '/models/heart.glb';

const USE_GLASS = false;
const BACKDROP = new THREE.Color('#1D4536');
const LIGHT_COLOR = '#8FE3BE';
const LIGHT_REACH = 3;
const LIGHT_DEPTH = -2;
const TARGET_SIZE = 2.5;
const SWING_DEGREES = 60;
const SWING_CENTRE_DEGREES = 210;
const SWING_SPEED = 0.5;
const BOB_HEIGHT = 0.2;
const BOB_SPEED = 1.5;
const SWING_HALF = (SWING_DEGREES * Math.PI) / 360;
const SWING_CENTRE = (SWING_CENTRE_DEGREES * Math.PI) / 180;
const TRANSMISSION = 0.88;

type Piece = {
    uuid: string;
    geometry: THREE.BufferGeometry;
    color: THREE.Color;
    map: THREE.Texture | null;
    vertexColors: boolean;
    position: [number, number, number];
    quaternion: [number, number, number, number];
    scale: [number, number, number];
};

function Model({ onReady, still }: { onReady: () => void; still: boolean }) {
    const { scene } = useGLTF(MODEL_PATH);
    const spin = useRef<THREE.Group>(null);

    const { pieces, offset, fit } = useMemo(() => {
        scene.updateMatrixWorld(true);

        const found: Piece[] = [];
        scene.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;

            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            mesh.matrixWorld.decompose(position, quaternion, scale);

            const source = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
                | THREE.MeshStandardMaterial
                | undefined;

            found.push({
                uuid: mesh.uuid,
                geometry: mesh.geometry,
                color: source?.color ? source.color.clone() : new THREE.Color('#ffffff'),
                map: source?.map ?? null,
                vertexColors: !!mesh.geometry.attributes.color,
                position: position.toArray() as [number, number, number],
                quaternion: quaternion.toArray() as [number, number, number, number],
                scale: scale.toArray() as [number, number, number],
            });
        });

        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const middle = box.getCenter(new THREE.Vector3());
        const largest = Math.max(size.x, size.y, size.z) || 1;

        return {
            pieces: found,
            offset: [-middle.x, -middle.y, -middle.z] as [number, number, number],
            fit: TARGET_SIZE / largest,
        };
    }, [scene]);

    useEffect(() => {
        onReady();
    }, [onReady]);

    useFrame(({ clock }) => {
        const g = spin.current;
        if (!g) return;

        if (still) {
            g.rotation.y = SWING_CENTRE;
            g.position.y = 0;
            return;
        }

        const t = clock.elapsedTime;
        g.rotation.y = SWING_CENTRE + Math.sin(t * SWING_SPEED) * SWING_HALF;
        g.position.y = Math.sin(t * BOB_SPEED) * BOB_HEIGHT;
    });

    return (
        <group ref={spin} scale={fit}>
            <group position={offset}>
                {pieces.map(({ uuid, geometry, color, map, vertexColors, position, quaternion, scale }) => (
                    <mesh
                        key={uuid}
                        geometry={geometry}
                        position={position}
                        quaternion={quaternion}
                        scale={scale}
                    >
                        {USE_GLASS ? (
                            <MeshTransmissionMaterial
                                color={color}
                                map={map ?? undefined}
                                vertexColors={vertexColors}
                                transmission={TRANSMISSION}
                                background={BACKDROP}
                                samples={6}
                                resolution={128}
                                thickness={0.2}
                                roughness={0.4}
                                metalness={0.1}
                                ior={1.4}
                                chromaticAberration={0.06}
                                distortion={0.1}
                                distortionScale={0.2}
                                temporalDistortion={0.05}
                            />
                        ) : (
                            <meshStandardMaterial
                                color={color}
                                map={map ?? undefined}
                                vertexColors={vertexColors}
                                roughness={0.4}
                                metalness={0.7}
                                // wireframe
                            />
                        )}
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function CursorLight({ still }: { still: boolean }) {
    const light = useRef<THREE.PointLight>(null);
    const cursor = useRef({ x: 0, y: 0, seen: false });

    useEffect(() => {
        if (still) return;

        const onMove = (e: MouseEvent) => {
            cursor.current.x = e.clientX;
            cursor.current.y = e.clientY;
            cursor.current.seen = true;
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, [still]);

    const wanted = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ camera, gl }) => {
        const l = light.current;
        if (!l) return;

        const rect = gl.domElement.getBoundingClientRect();
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));

        const x = cursor.current.seen
            ? clamp((cursor.current.x - (rect.left + rect.width / 2)) / (window.innerWidth / 2))
            : 0.4;
        const y = cursor.current.seen
            ? clamp(-(cursor.current.y - (rect.top + rect.height / 2)) / (window.innerHeight / 2))
            : 0.4;

        wanted.set(x * LIGHT_REACH, y * LIGHT_REACH, LIGHT_DEPTH);
        wanted.applyMatrix4(camera.matrixWorld);
        l.position.copy(wanted);
    });

    return (
        <pointLight
            ref={light}
            position={[2, 2, 5]}
            intensity={45}
            distance={50}
            decay={2}
            color={LIGHT_COLOR}
        />
    );
}

function Placeholder() {
    return (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-sage/20 px-4">
            <p className="text-center font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-sage/40">
                drop a .glb at
                <br />
                public{MODEL_PATH}
            </p>
        </div>
    );
}

export default function ModelViewer() {
    const [status, setStatus] = useState<'checking' | 'ready' | 'missing'>('checking');
    const [reduced, setReduced] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const handleReady = useCallback(() => setLoaded(true), []);

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

        let cancelled = false;
        fetch(MODEL_PATH, { method: 'HEAD' })
            .then((r) => {
                if (!cancelled) setStatus(r.ok ? 'ready' : 'missing');
            })
            .catch(() => {
                if (!cancelled) setStatus('missing');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === 'checking') return null;
    if (status === 'missing') return <Placeholder />;

    return (
        <div className={`h-full w-full ${loaded ? 'motion-safe:animate-page-in' : 'opacity-0'}`}>
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={0.35} />
                <directionalLight position={[-3, 4, 2]} intensity={0.8} />
                <CursorLight still={reduced} />
                <Environment resolution={256}>
                    <Lightformer
                        form="rect"
                        intensity={4}
                        color="#DCE7E0"
                        position={[0, 4, 2]}
                        scale={[8, 4, 1]}
                        rotation={[-Math.PI / 3, 0, 0]}
                    />
                    <Lightformer
                        form="circle"
                        intensity={2}
                        color="#6FC49B"
                        position={[-4, 1, 3]}
                        scale={4}
                    />
                    <Lightformer
                        form="rect"
                        intensity={2}
                        color="#3E7A63"
                        position={[4, -2, -3]}
                        scale={[8, 8, 1]}
                        rotation={[0, Math.PI / 2, 0]}
                    />
                </Environment>
                <Suspense fallback={null}>
                    <Model onReady={handleReady} still={reduced} />
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
}
