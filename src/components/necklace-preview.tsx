"use client";

import { motion } from "framer-motion";

interface NecklacePreviewProps {
    name: string;
    material: string;
    hasDiamonds: boolean;
}

export function NecklacePreview({ name, material, hasDiamonds }: NecklacePreviewProps) {
    // Determine color based on material
    const getMaterialColor = () => {
        switch (material) {
            case "white-gold": return { base: "#e2e8f0", highlight: "#ffffff", shadow: "#cbd5e1" };
            case "rose-gold": return { base: "#f4aba6", highlight: "#fed7d7", shadow: "#e19a95" };
            case "yellow-gold": default: return { base: "#ecc94b", highlight: "#fef08a", shadow: "#d69e2e" };
        }
    };

    const colors = getMaterialColor();

    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
            {/* Decorative background glow based on material */}
            <motion.div
                animate={{
                    backgroundColor: colors.base,
                    opacity: hasDiamonds ? 0.15 : 0.05
                }}
                transition={{ duration: 1 }}
                className="absolute inset-x-20 inset-y-20 blur-3xl rounded-full"
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* The Chain SVG (Mock representation) */}
                <svg width="300" height="150" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-[110px] drop-shadow-sm">
                    <motion.path
                        d="M0 0C50 100 100 140 150 140"
                        stroke={colors.base}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        animate={{ stroke: colors.base }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.path
                        d="M300 0C250 100 200 140 150 140"
                        stroke={colors.base}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        animate={{ stroke: colors.base }}
                        transition={{ duration: 0.5 }}
                    />
                    {/* Connector rings */}
                    <motion.circle cx="100" cy="120" r="4" stroke={colors.base} strokeWidth="1.5" fill="transparent" />
                    <motion.circle cx="200" cy="120" r="4" stroke={colors.base} strokeWidth="1.5" fill="transparent" />
                </svg>

                {/* The Nameplate */}
                <motion.div
                    key={name + material + hasDiamonds}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative flex items-center justify-center px-4"
                >
                    {/* Main Text */}
                    <span
                        className="font-serif text-6xl md:text-8xl tracking-widest relative z-10 select-none"
                        style={{
                            color: colors.base,
                            textShadow: hasDiamonds
                                ? `0px 2px 4px rgba(0,0,0,0.1), 0 0 15px rgba(255,255,255,0.8), inset 0 0 10px rgba(255,255,255,0.5)`
                                : `1px 2px 3px ${colors.shadow}, -1px -1px 1px ${colors.highlight}`
                        }}
                    >
                        {name || "..."}
                    </span>

                    {/* Diamond Overlays (Sparkles effect) */}
                    {hasDiamonds && name.length > 0 && (
                        <SparklesOverlay />
                    )}
                </motion.div>
            </div>
        </div>
    );
}

import React from 'react';

function SparklesOverlay() {
    interface Sparkle { id: string; left: string; top: string; duration: number; delay: number; }
    // Generate static random values once per mount to avoid hydration mismatches and impure renders
    const [sparkles, setSparkles] = React.useState<Sparkle[]>([]);

    React.useEffect(() => {
        setSparkles(Array.from({ length: 15 }).map(() => ({
            id: crypto.randomUUID(),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 1.5 + Math.random() * 2,
            delay: Math.random() * 2,
        })));
    }, []);

    if (sparkles.length === 0) return null;

    return (
        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none mix-blend-screen opacity-80" aria-hidden="true">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,1)]"
                    style={{
                        left: sparkle.left,
                        top: sparkle.top,
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                        duration: sparkle.duration,
                        repeat: Infinity,
                        delay: sparkle.delay,
                    }}
                />
            ))}
        </div>
    );
}
