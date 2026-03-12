"use client";

import { Canvas, useFrame } from "@react-three/fiber";
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
    // We use a custom GLTF loader call to load from external URL
    const { scene } = useGLTF(url) as any;

    // We need to clone the scene or traverse and apply our awesome materials to it
    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        clone.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // If the mesh is named DiamondInstance, it's the pave setting
                if (child.name === "DiamondInstance") {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: "#ffffff",
                        metalness: 1.0,
                        roughness: 0.05,
                        clearcoat: 1.0,
                        envMapIntensity: 4.0,
                        ior: 2.4,
                        transmission: 0.1
                    });
                } else {
                    // It's the gold base
                    child.material = new THREE.MeshPhysicalMaterial({
                        ...materialProps,
                        envMapIntensity: 1.5
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
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                setFov(55);
            } else {
                setFov(45);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const materialProps = useMemo(() => {
        let props = {
            color: new THREE.Color(),
            metalness: 1,
            roughness: 0.12,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            ior: 1.5,
        };

        switch (material) {
            case "white-gold":
                props.color.set("#ffffff");
                break;
            case "rose-gold":
                props.color.set("#e6a89c");
                break;
            case "yellow-gold":
            default:
                props.color.set("#f2c94c");
                break;
        }
        return props;
    }, [material]);

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 5], fov: fov }} shadows gl={{ antialias: true, toneMappingExposure: 1.1 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[5, 10, 5]} angle={0.4} penumbra={1} intensity={2.0} castShadow shadow-bias={-0.0001} />
                <spotLight position={[-10, 5, 10]} angle={0.3} penumbra={1} intensity={1.5} color="#ffffff" />
                <pointLight position={[0, -5, -5]} intensity={0.8} />

                <Environment preset="apartment" />

                {isGenerating ? (
                    <Html center>
                        <div className="flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-stone-800 dark:text-white pointer-events-none">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <div className="text-sm tracking-widest uppercase font-medium">Forging Necklace...</div>
                            <div className="text-xs opacity-60">Blender Engine is working</div>
                        </div>
                    </Html>
                ) : modelUrl ? (
                    <Bounds fit clip observe margin={1.2}>
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
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
                    <Bloom
                        luminanceThreshold={0.9}
                        luminanceSmoothing={0.5}
                        intensity={0.4}
                        mipmapBlur
                    />
                </EffectComposer>

                <ContactShadows position={[0, -2, 0]} opacity={0.7} scale={20} blur={2.0} far={4} color="#000000" />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
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
