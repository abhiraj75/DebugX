"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";

const LINKS = [
    { href: "#shatter", label: "How it works" },
    { href: "#visualizer", label: "Visualizer" },
    { href: "#features", label: "Features" },
];

/** Floating glass pill. Hides on scroll down, returns on scroll up. Lime progress line on top. */
export default function Navbar() {
    const { scrollY, scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState(false);

    useMotionValueEvent(scrollY, "change", (v) => {
        const prev = scrollY.getPrevious() ?? 0;
        setHidden(v > prev && v > 200 && !open);
    });

    return (
        <>
            <motion.div
                aria-hidden
                className="fixed inset-x-0 top-0 z-[95] h-[2px] origin-left bg-[var(--n-lime)]"
                style={{ scaleX: progress }}
            />
            <motion.header
                className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4"
                animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <nav className="flex w-full max-w-3xl flex-col rounded-[28px] border border-white/10 bg-[#0b0b10]/70 px-2 py-2 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 px-4 font-display text-sm font-bold tracking-tight">
                            <span className="h-2 w-2 rounded-full bg-[var(--n-lime)] shadow-[0_0_12px_var(--n-lime)]" />
                            debugx
                        </Link>
                        <div className="hidden items-center gap-1 md:flex">
                            {LINKS.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    className="rounded-full px-4 py-2 text-sm text-[var(--n-muted)] transition-colors hover:bg-white/5 hover:text-[var(--n-text)]"
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm text-[var(--n-muted)] hover:text-[var(--n-text)] sm:block">
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-full bg-[var(--n-lime)] px-5 py-2.5 text-sm font-semibold text-[#050507] transition-shadow hover:shadow-[0_0_30px_rgba(198,255,61,0.5)]"
                            >
                                Sign up
                            </Link>
                            <button
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                                onClick={() => setOpen((v) => !v)}
                                className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
                            >
                                <span className={`block h-px w-5 bg-white transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
                                <span className={`block h-px w-5 bg-white transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
                            </button>
                        </div>
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-2 pb-2 pt-3">
                            {[...LINKS, { href: "/login", label: "Log in" }].map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-2xl px-4 py-3 font-display text-lg text-[var(--n-text)] hover:bg-white/5"
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </nav>
            </motion.header>
        </>
    );
}
