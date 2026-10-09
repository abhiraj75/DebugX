"use client";

import { useRef } from "react";
import { motion, transform, useScroll, useTransform } from "motion/react";
import ShaderCanvas from "./ShaderCanvas";
import ScrambleText from "./ScrambleText";
import { MagneticNextLink } from "./MagneticLink";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeroSection({ ready }: { ready: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
    // function mappers: keep opacity off native ScrollTimeline (see ShatterScene)
    const bgOpacity = useTransform(scrollYProgress, transform([0, 0.9], [1, 0.15]));
    const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
    const textOpacity = useTransform(scrollYProgress, transform([0, 0.6], [1, 0]));
    const textBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(12px)"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

    const fade = (delay: number) => ({
        initial: { opacity: 0, y: 24 },
        animate: ready ? { opacity: 1, y: 0 } : {},
        transition: { duration: 0.9, delay, ease: EASE },
    });

    return (
        <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
            <motion.div className="absolute inset-0" style={{ scale: bgScale, opacity: bgOpacity }}>
                <ShaderCanvas className="h-full w-full" />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050507] to-transparent" />

            <motion.div
                className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-4 sm:px-8"
                style={{ scale: textScale, opacity: textOpacity, filter: textBlur, y: textY }}
            >
                <motion.div {...fade(0)} className="mb-8 flex items-center gap-3 font-code text-[11px] uppercase tracking-[0.3em] text-[var(--n-muted)]">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--n-lime)] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--n-lime)]" />
                    </span>
                    AI debugger · visualizer · learning path
                </motion.div>

                <h1 className="font-display font-black uppercase leading-[0.9] tracking-[-0.04em] text-[clamp(44px,9.5vw,152px)]">
                    <ScrambleText text="Your code" play={ready} className="block" />
                    <ScrambleText text="failed." play={ready} delay={250} className="block" />
                    <motion.span
                        className="block"
                        initial={{ clipPath: "inset(0 100% 0 0)" }}
                        animate={ready ? { clipPath: "inset(0 0% 0 0)" } : {}}
                        transition={{ duration: 1.1, delay: 0.9, ease: EASE }}
                    >
                        <span className="shimmer-text">Here&apos;s why.</span>
                    </motion.span>
                </h1>

                <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                    <motion.p {...fade(1.2)} className="max-w-md text-[17px] leading-relaxed text-[#b8b8c6] sm:text-lg">
                        Stop staring at the same bug for 3 hours. DebugX points at the exact line, explains
                        the <em className="not-italic text-[var(--n-text)]">why</em>, and lets you watch every variable change.
                    </motion.p>
                    <motion.div {...fade(1.35)} className="flex flex-wrap items-center gap-3">
                        <MagneticNextLink
                            href="/signup"
                            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--n-lime)] px-7 py-4 font-code text-sm font-semibold text-[#050507]"
                            radius={110}
                            strength={0.45}
                        >
                            <span data-cursor="go" className="relative z-10">Start debugging — free</span>
                            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                            <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 ease-out group-hover:translate-x-0" />
                        </MagneticNextLink>
                        <a
                            href="#shatter"
                            className="rounded-full border border-white/15 px-6 py-4 font-code text-sm text-[var(--n-text)] backdrop-blur-sm transition-colors hover:border-white/40"
                        >
                            Watch it fix code ↓
                        </a>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                {...fade(1.6)}
                className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-code text-[10px] uppercase tracking-[0.3em] text-[var(--n-muted)]"
            >
                scroll
                <span className="relative block h-10 w-px overflow-hidden bg-white/10">
                    <motion.span
                        className="absolute inset-x-0 top-0 h-1/2 bg-[var(--n-lime)]"
                        animate={{ y: ["-100%", "200%"] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </span>
            </motion.div>
        </section>
    );
}
