"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1,
            }}
            className="flex-1 flex flex-col w-full h-full"
        >
            {children}
        </motion.div>
    );
}
