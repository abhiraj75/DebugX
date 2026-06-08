"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => {
        setScrolled(v > 12);
    });

    // close mobile on resize up
    useEffect(() => {
        const onR = () => {
            if (window.innerWidth >= 768) setMobileOpen(false);
        };
        window.addEventListener("resize", onR);
        return () => window.removeEventListener("resize", onR);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-[80] transition-all duration-300 border-b ${
                scrolled
                    ? "bg-[var(--term-bg)]/85 backdrop-blur-md border-[var(--term-border)]"
                    : "bg-[var(--term-bg)] border-transparent"
            }`}
        >
            <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 font-term text-[13px]">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-[var(--term-green)]">debugx</span>
                    <span className="text-[var(--term-muted)]">@v1.0</span>
                    <span className="cursor-blink text-[var(--term-green)] -translate-y-px">_</span>
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-7">
                    <Link href="#problem" className="text-[var(--term-white)]/80 hover:text-[var(--term-white)] transition-colors">problem</Link>
                    <Link href="#ai-feedback" className="text-[var(--term-white)]/80 hover:text-[var(--term-white)] transition-colors">how it works</Link>
                    <Link href="#stats" className="text-[var(--term-white)]/80 hover:text-[var(--term-white)] transition-colors">community</Link>
                    <span className="text-[var(--term-border)]">|</span>
                    <Link href="/login" className="text-[var(--term-white)]/80 hover:text-[var(--term-white)] transition-colors">login</Link>
                    <Link href="/signup" className="text-[var(--term-green)] hover:text-[var(--term-green-dim)] transition-colors">signup →</Link>
                </div>

                {/* Mobile toggle */}
                <button
                    aria-label="menu"
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden flex flex-col gap-1 p-2"
                >
                    <span className={`block h-px w-5 bg-[var(--term-white)] transition-transform ${mobileOpen ? "translate-y-[5px] rotate-45" : ""}`} />
                    <span className={`block h-px w-5 bg-[var(--term-white)] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-px w-5 bg-[var(--term-white)] transition-transform ${mobileOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
                </button>
            </nav>

            {/* Mobile sheet */}
            <motion.div
                initial={false}
                animate={{
                    height: mobileOpen ? "auto" : 0,
                    opacity: mobileOpen ? 1 : 0,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden overflow-hidden border-t border-[var(--term-border)] bg-[var(--term-bg)]"
            >
                <div className="px-5 py-4 font-term text-[13px] space-y-3">
                    <div className="text-[var(--term-muted)] text-[11px] uppercase tracking-widest">$ ls /</div>
                    {[
                        { href: "#problem", label: "problem" },
                        { href: "#ai-feedback", label: "how it works" },
                        { href: "#stats", label: "community" },
                        { href: "/login", label: "login" },
                    ].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-[var(--term-white)]/90 hover:text-[var(--term-green)]"
                        >
                            <span className="text-[var(--term-muted)] mr-2">›</span>
                            {l.label}
                        </Link>
                    ))}
                    <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="block text-[var(--term-green)] hover:text-[var(--term-green-dim)]"
                    >
                        <span className="mr-2">›</span>signup →
                    </Link>
                </div>
            </motion.div>
        </header>
    );
}
