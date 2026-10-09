"use client";

import { motion } from "motion/react";
import ShaderCanvas from "./ShaderCanvas";
import { MagneticNextLink } from "./MagneticLink";

const EASE = [0.16, 1, 0.3, 1] as const;

// Observe the h2, not the clipped inner spans: a fully clipped element never intersects.
function MaskLine({ children, delay }: { children: React.ReactNode; delay: number }) {
    return (
        <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
                className="block"
                variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.1, delay, ease: EASE } } }}
            >
                {children}
            </motion.span>
        </span>
    );
}

export default function FinalCTA() {
    return (
        <section className="relative overflow-hidden">
            <ShaderCanvas intensity={0.8} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#050507]/40 to-[#050507]" />

            <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-4 py-32 sm:px-8">
                <motion.h2
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    className="font-display text-[clamp(44px,10vw,168px)] font-black uppercase leading-[0.88] tracking-[-0.05em]"
                >
                    <MaskLine delay={0}>Stop</MaskLine>
                    <MaskLine delay={0.08}>guessing.</MaskLine>
                    <MaskLine delay={0.2}>
                        <span className="shimmer-text">Start knowing.</span>
                    </MaskLine>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
                    className="mt-14 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between"
                >
                    <ul className="grid grid-cols-2 gap-x-8 gap-y-3 font-code text-sm text-[#b8b8c6]">
                        {["free forever", "no card required", "setup in ~12 seconds", "AI feedback on"].map((t) => (
                            <li key={t}>
                                <span className="mr-2 text-[var(--n-lime)]">✓</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                    <MagneticNextLink
                        href="/signup"
                        className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-[var(--n-lime)] px-10 py-6 font-display text-lg font-bold text-[#050507] shadow-[0_0_80px_rgba(198,255,61,0.35)] sm:text-xl"
                        radius={140}
                        strength={0.4}
                    >
                        <span data-cursor="let's go" className="relative z-10">Start debugging</span>
                        <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#050507] text-[var(--n-lime)] transition-transform duration-500 group-hover:rotate-[-45deg]">
                            →
                        </span>
                        <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
                    </MagneticNextLink>
                </motion.div>
            </div>

            <footer className="relative border-t border-white/10">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-3 px-4 py-8 font-code text-xs text-[var(--n-muted)] sm:flex-row sm:px-8">
                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--n-lime)]" /> debugx
                    </span>
                    <span>© 2026 DebugX</span>
                </div>
            </footer>
        </section>
    );
}
