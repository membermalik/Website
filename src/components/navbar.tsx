"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/use-cart";
import { useEffect, useState } from "react";

export function Navbar() {
    const { openCart, items } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-widest uppercase font-serif">
                    Aura
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/customizer" className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors">Custom Name</Link>
                    <Link href="#" className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors">About</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors" aria-label="User account">
                        <User className="w-5 h-5" />
                    </button>
                    <button
                        onClick={openCart}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors relative"
                        aria-label="Shopping bag"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {mounted && totalItems > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
