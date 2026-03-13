"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows, Float, Bounds, useGLTF, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

interface True3DNecklaceProps {
    name: string;
    material: string;
    hasDiamonds: boolean;
    modelUrl: string | null;
    isGenerating: boolean;
}

function GeneratedModel({ url, materialProps, hasDiamonds }: { url: string, materialProps: any, hasDiamonds: boolean }) {
    const { scene } = useGLTF(url) as any;

    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        clone.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.name === "DiamondInstance") {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: "#ffffff",
                        metalness: 0,
                        roughness: 0.0,
                        clearcoat: 1.0,
                        ior: 2.4,
                        transmission: 0.95,
                        envMapIntensity: 4.0,
                    });
                } else {
                    child.material = new THREE.MeshPhysicalMaterial({
                        ...materialProps,
                        envMapIntensity: 2.5,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.04,
                    });
                }
            }
        });
        return clone;
    }, [scene, materialProps]);

    return <primitive object={clonedScene} />;
}

export function True3DNecklace({ name, material, hasDiamonds, modelUrl, isGenerating }: True3DNecklaceProps) {
    const [fov, setFov] = useState(45);

    useEffect(() => {
        const h = () => setFov(window.innerWidth >= 768 && window.innerWidth < 1024 ? 55 : 45);
        h();
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const materialProps = useMemo(() => {
        const color = new THREE.Color();
        switch (material) {
            case "white-gold": color.set("#e8e8ef"); break;
            case "rose-gold": color.set("#e6a89c"); break;
            default: color.set("#f2c94c"); break;
        }
        return { color, metalness: 1, roughness: 0.10 };
    }, [material]);

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            {/*
              Camera at [0, 0, 0.12] — looking straight at the front face of the pendant.
              Blender exports with Y-up; the text face points in +Z in Three.js space.
              <Bounds fit> auto-zooms to fill the pendant correctly.
            */}
            <Canvas
                camera={{ position: [0, 0, 0.12], fov: fov, near: 0.0005, far: 10 }}
                shadows
                gl={{ antialias: true, toneMappingExposure: 1.25 }}
            >
                <ambientLight intensity={0.7} />
                <spotLight
                    position={[0.08, 0.06, 0.15]}
                    angle={0.5} penumbra={1} intensity={2.5}
                    castShadow shadow-bias={-0.0001}
                />
                <spotLight
                    position={[-0.08, 0.03, 0.12]}
                    angle={0.4} penumbra={1} intensity={1.8}
                    color="#fff8e7"
                />
                <pointLight position={[0, -0.04, 0.08]} intensity={0.5} />

                <Environment preset="apartment" />

                {isGenerating ? (
                    <Html center>
                        <div className="flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-stone-800 dark:text-white pointer-events-none">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <div className="text-sm tracking-widest uppercase font-medium">Forging Pendant...</div>
                            <div className="text-xs opacity-60">Blender + OpenSCAD working</div>
                        </div>
                    </Html>
                ) : modelUrl ? (
                    <Bounds fit clip observe margin={1.5}>
                        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
                            <GeneratedModel url={modelUrl} materialProps={materialProps} hasDiamonds={hasDiamonds} />
                        </Float>
                    </Bounds>
                ) : (
                    <Html center>
                        <div className="text-sm tracking-widest uppercase font-medium text-stone-500 opacity-50 px-8 text-center pointer-events-none">
                            Enter name and click "Generate Preview"
                        </div>
                    </Html>
                )}

                <EffectComposer enabled enableNormalPass={false}>
                    <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.4} intensity={0.5} mipmapBlur />
                </EffectComposer>

                <ContactShadows
                    position={[0, -0.035, 0]}
                    opacity={0.4} scale={0.3} blur={2.5} far={0.08}
                    color="#000000"
                />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={0.04}
                    maxDistance={0.25}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI * 0.75}
                    autoRotate={!modelUrl}
                    autoRotateSpeed={0.6}
                    makeDefault
                />
            </Canvas>

            {!isGenerating && modelUrl && (
                <div className="absolute bottom-16 w-full flex justify-center pointer-events-none opacity-50 z-20">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] tracking-[0.3em] font-medium text-stone-500 dark:text-white/50 uppercase">Drag to Rotate</span>
                        <div className="h-4 w-px bg-stone-500/50 dark:bg-white/30" />
                    </div>
                </div>
            )}
        </div>
    );
}
