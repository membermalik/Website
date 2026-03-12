"use client";

import { useRef, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Diamond({ position, scale, rotationSpeed }: { position: [number, number, number], scale: number, rotationSpeed: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { nodes } = useGLTF('/diamonds.glb') as any;

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += rotationSpeed * 0.5 * delta;
            meshRef.current.rotation.y += rotationSpeed * 0.5 * delta;
            meshRef.current.rotation.z += rotationSpeed * 0.2 * delta;
        }
    });

    return (
        <Float floatIntensity={1} rotationIntensity={0.5} speed={1.5}>
            <mesh ref={meshRef} position={position} scale={scale} geometry={nodes.Diamond.geometry} dispose={null}>
                {/* Photorealistic Mathematical Diamond Material */}
                <meshPhysicalMaterial
                    transparent={false}
                    opacity={1}
                    roughness={0} // Perfect mirror polish
                    metalness={1} // Acts as a pure chrome/mirror reflector
                    color="#e0f0ff" // Icy blue-white base to counteract beige reflections
                    emissive="#b0d0ff" // Very subtle blue tint
                    emissiveIntensity={0.15} // Slight glow to keep them looking like pure crisp diamonds
                    clearcoat={1}
                    clearcoatRoughness={0}
                    reflectivity={2} // Maximum glare
                    envMapIntensity={4} // Massive HDR reflection to fake complex internal bounce
                />
            </mesh>
        </Float>
    );
}

const DIAMOND_DATA = [
    { rx: 0.3, ry: 0.2, z: 2, scaleMult: 1.2, rot: 1.5 },
    { rx: -0.2, ry: -0.3, z: -1, scaleMult: 0.8, rot: 0.8 },
    { rx: -0.35, ry: 0.1, z: 3, scaleMult: 1.5, rot: 1.2 },
    { rx: 0.1, ry: -0.35, z: -4, scaleMult: 0.6, rot: 2.0 },
    { rx: 0.35, ry: -0.1, z: 1, scaleMult: 1.1, rot: 1.0 },
    { rx: -0.1, ry: 0.35, z: 0, scaleMult: 0.9, rot: 0.6 },
    { rx: 0.2, ry: 0.3, z: -2, scaleMult: 0.7, rot: 1.8 },
    { rx: -0.3, ry: -0.2, z: 4, scaleMult: 1.3, rot: 1.4 },
    { rx: 0.05, ry: 0.05, z: -3, scaleMult: 1.0, rot: 0.9 },
];

function Scene() {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const targetRotation = useRef({ x: 0, y: 0 });

    // Generate exactly 9 diamonds strictly confined to the viewport format
    const diamonds = useMemo(() => {
        useGLTF.preload('/diamonds.glb');

        // Return exactly 9 diamonds using fixed positions
        return DIAMOND_DATA.map((data) => {
            const aspect = viewport.width / viewport.height;
            const x = data.rx * viewport.width;
            const y = data.ry * viewport.height;
            const z = data.z;

            // Fixed scaling logic
            const baseScale = aspect > 1 ? 0.3 : 0.2;
            const scale = baseScale * data.scaleMult * 1.5;

            return {
                position: [x, y, z] as [number, number, number],
                scale,
                rotationSpeed: data.rot
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewport.width, viewport.height]); // Empty dependency array ensures they never respawn or jump on scroll

    // Handle user drag interaction
    useFrame((state, delta) => {
        if (groupRef.current) {
            // If dragging, smoothly lerp to target rotation
            if (isDragging) {
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.1);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.1);
            } else {
                // Ambient slow float when not interacting
                groupRef.current.rotation.y += delta * 0.05;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.02);
            }
        }
    });

    const handlePointerDown = (e: any) => {
        setIsDragging(true);
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
        // Apply grabbing cursor
        document.body.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
    };

    const handlePointerMove = (e: any) => {
        if (isDragging) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.current.x,
                y: e.clientY - previousMousePosition.current.y
            };

            targetRotation.current.y += deltaMove.x * 0.005;
            targetRotation.current.x += deltaMove.y * 0.005;

            previousMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            onPointerMove={handlePointerMove}
        >
            {diamonds.map((props, i) => (
                <Diamond key={i} {...props} />
            ))}
            <Suspense fallback={null}>
                {/* 'apartment' provides the high-contrast black/white windows needed for authentic diamond faceting */}
                <Environment files="/apartment.hdr" />
            </Suspense>
            {/* Very low ambient light so the contrast stays sharp */}
            <ambientLight intensity={0.2} color="#ffffff" />
            {/* Extremely bright, sharp spotlight to trigger the dispersion rainbows */}
            <directionalLight position={[10, 20, 10]} intensity={30} color="#ffffff" castShadow />
            <directionalLight position={[-10, -10, -10]} intensity={10} color="#eef2ff" />
            <pointLight position={[0, 0, 10]} intensity={25} color="#ffffff" />
        </group>
    );
}

export default function InteractiveDiamonds() {
    return (
        <Canvas
            camera={{ position: [0, 0, 20], fov: 45 }}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            dpr={1} // Fixed DPR of 1 to prevent ultra-high resolution transmission buffer crashes on Retina
            gl={{
                alpha: true,
                antialias: false, // Antialiasing with transmission buffers is a massive GPU killer
                powerPreference: "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.5 // Overexpose slightly to make the diamonds "bling"
            }}
        >
            <Scene />
        </Canvas>
    );
}

useGLTF.preload('/diamonds.glb');

