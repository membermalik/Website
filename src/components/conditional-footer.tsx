"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
    const pathname = usePathname();

    // Do not render the global footer on the homepage.
    // The homepage manages its own scrolling container and includes the Footer directly to prevent double-scrollbars.
    if (pathname === "/") return null;

    return <Footer />;
}
