"use client";

import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const getMaterialLabel = (mat: string) => {
    switch (mat) {
        case 'white-gold': return '14k White Gold';
        case 'rose-gold': return '14k Rose Gold';
        case 'yellow-gold': default: return '14k Yellow Gold';
    }
};

const getMaterialGradient = (mat: string) => {
    switch (mat) {
        case 'white-gold': return 'from-neutral-200 to-neutral-400';
        case 'rose-gold': return 'from-rose-300 to-rose-400';
        case 'yellow-gold': default: return 'from-yellow-300 to-yellow-500';
    }
}

export function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-xl font-serif tracking-widest uppercase flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5" /> Your Cart
                            </h2>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                                aria-label="Close cart"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                                    <ShoppingBag className="w-16 h-16 mb-6 opacity-20" />
                                    <p className="text-lg mb-4">Your cart is empty.</p>
                                    <Link
                                        href="/customizer"
                                        onClick={closeCart}
                                        className="text-sm uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:text-neutral-400 transition-colors"
                                    >
                                        Start Designing
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-8">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex gap-6 group">
                                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getMaterialGradient(item.material)} flex items-center justify-center shrink-0 shadow-inner`}>
                                                <span className="font-serif italic text-3xl text-black/40 mix-blend-overlay">{item.name[0]}</span>
                                            </div>

                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-serif text-lg">{item.name}</h3>
                                                    <span className="font-medium">${item.price}</span>
                                                </div>

                                                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
                                                    {getMaterialLabel(item.material)} {item.hasDiamonds ? "+ Diamonds" : ""}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="uppercase tracking-widest text-sm font-medium">Subtotal</span>
                                    <span className="text-xl font-serif">${total}</span>
                                </div>
                                <p className="text-xs text-neutral-500 mb-6 text-center">
                                    Taxes and shipping calculated at checkout.
                                </p>
                                <button className="w-full py-4 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors uppercase tracking-widest text-sm font-medium">
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
