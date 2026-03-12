"use client";

import { useState } from "react";
import { useCartStore } from "@/store/use-cart";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Product {
    id: string;
    title: string;
    handle: string;
    description: string;
    price: number;
    currencyCode: string;
    images: { url: string; altText: string }[];
    materials: string[];
}

export function ProductDetails({ product }: { product: Product }) {
    const [selectedMaterial, setSelectedMaterial] = useState(product.materials[0] || "yellow-gold");
    const { addItem } = useCartStore();

    const handleAddToCart = () => {
        addItem({
            id: crypto.randomUUID(),
            name: product.title,
            material: selectedMaterial,
            hasDiamonds: product.handle === 'diamond-letter-pendant', // Mock logic for diamonds based on handle
            price: product.price,
            quantity: 1
        });
    };

    const getMaterialLabel = (mat: string) => {
        switch (mat) {
            case 'yellow-gold': return '14k Yellow Gold';
            case 'white-gold': return '14k White Gold';
            case 'rose-gold': return '14k Rose Gold';
            default: return mat;
        }
    }

    const getMaterialColor = (mat: string) => {
        switch (mat) {
            case 'yellow-gold': return 'bg-yellow-400';
            case 'white-gold': return 'bg-neutral-200';
            case 'rose-gold': return 'bg-rose-300';
            default: return 'bg-neutral-400';
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Product Image */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full"
            >
                <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center text-neutral-400">
                    {product.images?.[0]?.url ? (
                        <Image
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <span className="text-sm font-light uppercase tracking-widest">No Image Configured in Shopify</span>
                    )}
                </div>
            </motion.div>

            {/* Product Info & Controls */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col justify-center gap-8"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.title}</h1>
                    <p className="text-2xl font-light tracking-wide mb-6">${product.price.toFixed(2)} {product.currencyCode}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                        {product.description}
                    </p>
                </div>

                {product.materials.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-widest uppercase text-neutral-500">
                            Material: <span className="text-black dark:text-white capitalize">{getMaterialLabel(selectedMaterial)}</span>
                        </h3>
                        <div className="flex gap-4">
                            {product.materials.map((mat) => (
                                <button
                                    key={mat}
                                    onClick={() => setSelectedMaterial(mat)}
                                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${getMaterialColor(mat)} ${selectedMaterial === mat
                                        ? "ring-2 ring-offset-4 ring-black dark:ring-white dark:ring-offset-black scale-110"
                                        : "hover:scale-105 opacity-80 hover:opacity-100"
                                        }`}
                                    aria-label={`Select ${mat}`}
                                >
                                    {selectedMaterial === mat && (
                                        <Check className={`w-5 h-5 ${mat === "white-gold" ? "text-black" : "text-white"}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleAddToCart}
                    className="w-full group relative inline-flex items-center justify-center px-8 py-5 text-base font-medium text-white transition-all duration-300 bg-black dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 mt-4 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Add to Cart - ${product.price.toFixed(2)} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>

            </motion.div>
        </div>
    );
}
