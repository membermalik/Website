"use client";

import { useState, useRef } from "react";
import { Sparkles, Check, ArrowRight, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/use-cart";
import { True3DNecklace } from "@/components/true-3d-necklace";
import { motion, Variants } from "framer-motion";

export default function CustomizerPage() {
    const [name, setName] = useState("Aura");
    const [material, setMaterial] = useState("yellow-gold");
    const [hasDiamonds, setHasDiamonds] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const { addItem } = useCartStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleGeneratePreview = async () => {
        setIsGenerating(true);
        setModelUrl(null);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        try {
            const res = await fetch(`${backendUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, material, hasDiamonds })
            });
            const data = await res.json();
            const jobId = data.job_id;

            const poll = setInterval(async () => {
                const statusRes = await fetch(`${backendUrl}/api/status/${jobId}`);
                const statusData = await statusRes.json();
                if (statusData.status === "completed") {
                    setModelUrl(`${backendUrl}${statusData.url}`);
                    setIsGenerating(false);
                    clearInterval(poll);
                } else if (statusData.status === "failed") {
                    setIsGenerating(false);
                    clearInterval(poll);
                    alert("Generation failed");
                }
            }, 2000);
        } catch (e) {
            setIsGenerating(false);
            alert("Error connecting to Blender server");
        }
    };

    const materials = [
        { id: "yellow-gold", label: "14k Yellow Gold", color: "bg-yellow-400" },
        { id: "white-gold", label: "14k White Gold", color: "bg-neutral-200" },
        { id: "rose-gold", label: "14k Rose Gold", color: "bg-rose-300" },
    ];

    // Derive price based on selections (mock)
    const basePrice = 350;
    const diamondAddOn = hasDiamonds ? (name.length * 50) : 0;
    const price = basePrice + diamondAddOn;

    const handleAddToCart = () => {
        if (!name.trim()) return;

        addItem({
            id: crypto.randomUUID(),
            name: name.trim(),
            material,
            hasDiamonds,
            price,
            quantity: 1
        });
    };

    // Shared animation variants for sections sliding up
    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1] // Custom snappy ease-out like Vibrant
            }
        }
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-[#FDFBF7] dark:bg-neutral-950 text-stone-900 dark:text-white selection:bg-stone-500/20 overflow-hidden flex flex-col md:flex-row">

            {/* FIXED 3D BACKGROUND (Top on Mobile, Right on Desktop) */}
            <div className="absolute md:relative top-0 w-full h-[45vh] md:h-full md:w-[60vw] md:order-2 pointer-events-auto z-0 flex justify-center items-center">
                <div className="w-full h-full opacity-100">
                    <True3DNecklace name={name} material={material} hasDiamonds={hasDiamonds} modelUrl={modelUrl} isGenerating={isGenerating} />
                </div>
                {/* Subtle vignette/gradient to blend the hard edges on desktop */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#FDFBF7] dark:from-neutral-950 via-transparent to-transparent pointer-events-none w-[20%]" />
            </div>

            {/* SCROLLABLE INTERACTION PANEL (Bottom-Sheet on Mobile, Left Column on Desktop) */}
            <div
                ref={scrollRef}
                className="absolute md:relative bottom-0 w-full h-[60vh] md:h-full md:w-[40vw] lg:w-[40vw] md:order-1 z-10 bg-[#FDFBF7]/95 dark:bg-neutral-950/95 md:bg-[#FDFBF7] md:dark:bg-neutral-950 backdrop-blur-2xl md:backdrop-blur-none rounded-t-[2.5rem] md:rounded-none shadow-[0_-20px_40px_rgba(0,0,0,0.05)] dark:shadow-none overflow-y-auto border-t md:border-t-0 md:border-r border-stone-200 dark:border-white/10 custom-scrollbar scroll-smooth snap-y snap-mandatory">

                {/* Mobile drag indicator */}
                <div className="md:hidden w-full flex justify-center absolute top-4 left-0 z-20 pointer-events-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-white/20 rounded-full" />
                </div>

                {/* Main scroll content wrapper */}
                <div className="w-full flex flex-col">

                    {/* Intro Section */}
                    <section className="relative w-full h-[60vh] md:h-full md:min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 pt-8 md:pt-0 text-center snap-start snap-always">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariants}
                            className="w-full max-w-sm pointer-events-auto flex flex-col items-center"
                        >
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-3 text-stone-500 dark:text-white/50">
                                <Sparkles className="w-3 h-3 md:w-3 md:h-3" /> Personalize
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-none mb-6 text-stone-900 dark:text-white">
                                The <span className="italic font-light opacity-90 pr-2 pb-1 inline-block">Legacy</span>
                            </h1>
                            <p className="text-sm md:text-base text-stone-500 dark:text-white/60 font-light leading-relaxed mb-10 max-w-[280px] md:max-w-[320px]">
                                Scroll down to begin crafting your unique aura. The 3D model alongside updates live.
                            </p>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <ChevronDown className="w-6 h-6 text-stone-300 dark:text-white/30" />
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Divider */}
                    <div className="w-full px-12 md:px-16"><div className="h-px w-full bg-stone-200 dark:bg-white/10" /></div>

                    {/* Chapter 1: The Name */}
                    <section className="relative w-full h-[60vh] md:h-full md:min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 text-center snap-start snap-always py-12 md:py-0">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ root: scrollRef, once: false, amount: 0.1, margin: "100px" }}
                            variants={sectionVariants}
                            className="w-full max-w-sm pointer-events-auto flex flex-col items-center"
                        >
                            <h2 className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-stone-500 dark:text-white/50 mb-3">
                                01. Identity
                            </h2>
                            <h3 className="text-3xl md:text-5xl font-serif mb-12 text-stone-800 dark:text-white">What is your story?</h3>

                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={10}
                                    placeholder="Enter Name"
                                    className="w-full bg-transparent border-b border-stone-300 dark:border-white/20 py-4 text-3xl md:text-5xl font-serif text-center focus:outline-none focus:border-stone-800 dark:focus:border-white transition-colors placeholder:text-stone-300 dark:placeholder:text-white/10 text-stone-900 dark:text-white"
                                />
                                <div className="absolute right-0 bottom-4 text-xs text-stone-400 dark:text-white/30 font-light opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                                    {name.length}/10
                                </div>
                            </div>

                            <button
                                onClick={handleGeneratePreview}
                                disabled={isGenerating || !name.trim()}
                                className="mt-12 px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl text-sm tracking-[0.2em] uppercase font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-xl"
                            >
                                {isGenerating ? "Forging in Blender..." : "Generate 3D Preview"}
                            </button>
                        </motion.div>
                    </section>

                    {/* Divider */}
                    <div className="w-full px-12 md:px-16"><div className="h-px w-full bg-stone-200 dark:bg-white/10" /></div>

                    {/* Chapter 2: The Material */}
                    <section className="relative w-full h-[60vh] md:h-full md:min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 text-center snap-start snap-always py-12 md:py-0">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ root: scrollRef, once: false, amount: 0.1, margin: "100px" }}
                            variants={sectionVariants}
                            className="w-full max-w-sm pointer-events-auto flex flex-col items-center"
                        >
                            <h2 className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-stone-500 dark:text-white/50 mb-3">
                                02. The Canvas
                            </h2>
                            <h3 className="text-3xl md:text-5xl font-serif mb-12 text-stone-800 dark:text-white">Choose a tone.</h3>

                            <div className="flex gap-6 md:gap-8 justify-center w-full">
                                {materials.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMaterial(m.id)}
                                        className={`group flex flex-col items-center gap-4 transition-all`}
                                    >
                                        <div className={`
                                            relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer
                                            ${m.color} 
                                            ${material === m.id
                                                ? 'scale-110 shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-[3px] ring-stone-900 dark:ring-white ring-offset-4 ring-offset-[#FDFBF7] dark:ring-offset-neutral-950'
                                                : 'opacity-50 dark:opacity-40 hover:opacity-100 scale-100 hover:scale-105'
                                            }
                                        `}>
                                        </div>
                                        <span className={`text-[10px] md:text-xs tracking-[0.1em] transition-colors ${material === m.id ? 'text-stone-900 dark:text-white font-medium' : 'text-stone-500 dark:text-white/40'}`}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    {/* Divider */}
                    <div className="w-full px-12 md:px-16"><div className="h-px w-full bg-stone-200 dark:bg-white/10" /></div>

                    {/* Chapter 3: The Diamonds & Checkout */}
                    <section className="relative w-full h-[60vh] md:h-full md:min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 text-center snap-start snap-always py-12 md:py-0">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ root: scrollRef, once: false, amount: 0.1, margin: "100px" }}
                            variants={sectionVariants}
                            className="w-full max-w-sm pointer-events-auto flex flex-col items-center h-full justify-center md:py-16"
                        >
                            <div className="flex flex-col justify-center w-full">
                                <h2 className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-stone-500 dark:text-white/50 mb-3">
                                    03. Radiance
                                </h2>
                                <h3 className="text-3xl md:text-5xl font-serif mb-10 text-stone-800 dark:text-white">Add brilliance.</h3>

                                <div className="flex flex-col gap-4 w-full mb-10">
                                    <button
                                        onClick={() => setHasDiamonds(false)}
                                        className={`w-full py-5 px-6 border backdrop-blur-sm transition-all rounded-xl text-left flex justify-between items-center text-base md:text-lg cursor-pointer
                                            ${!hasDiamonds
                                                ? 'border-stone-900 bg-stone-100 dark:border-white dark:bg-white/10 text-stone-900 dark:text-white shadow-md shadow-stone-900/5'
                                                : 'border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/30 text-stone-500 dark:text-white/50'}`}
                                    >
                                        <span className="font-serif italic pl-2">Pure Solid Gold</span>
                                        {!hasDiamonds && <Check className="w-5 h-5 mr-1" />}
                                    </button>
                                    <button
                                        onClick={() => setHasDiamonds(true)}
                                        className={`w-full py-5 px-6 border backdrop-blur-sm transition-all rounded-xl text-left flex justify-between items-center text-base md:text-lg cursor-pointer
                                            ${hasDiamonds
                                                ? 'border-stone-900 bg-stone-100 dark:border-white dark:bg-white/10 text-stone-900 dark:text-white shadow-md shadow-stone-900/5'
                                                : 'border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/30 text-stone-500 dark:text-white/50'}`}
                                    >
                                        <span className="flex items-center gap-3 font-serif italic pl-2"><Sparkles className="w-4 h-4" /> Diamond Pavé</span>
                                        <div className="flex items-center gap-3 mr-1">
                                            <span className="text-sm not-italic opacity-60 font-medium">+${diamondAddOn}</span>
                                            {hasDiamonds && <Check className="w-5 h-5" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Final CTA Area */}
                            <div className="w-full pt-8 border-t border-stone-200 dark:border-white/10 mt-auto md:mt-auto pb-4 md:pb-0">
                                <div className="flex justify-between items-end mb-8 px-2">
                                    <span className="text-stone-500 dark:text-white/40 uppercase tracking-[0.15em] text-xs font-semibold">Total</span>
                                    <span className="text-4xl md:text-5xl font-serif font-light text-stone-900 dark:text-white">${price}</span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!name.trim()}
                                    className="w-full py-6 bg-stone-900 dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-neutral-200 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs font-bold flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 group rounded-xl shadow-xl shadow-stone-900/10 dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] cursor-pointer"
                                >
                                    Acquire Piece <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                                </button>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </div>
        </div>
    );
}
