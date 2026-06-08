"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import TerminalWindow, { CursorBlink } from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";
import { MagneticNextLink } from "./MagneticLink";

/* Sequential typewriter line */
function TypeLine({
    text,
    color = "white",
    speed = 22,
    startDelay = 0,
    enabled,
    onDone,
    bold = false,
}: {
    text: string;
    color?: "white" | "green" | "muted" | "yellow";
    speed?: number;
    startDelay?: number;
    enabled: boolean;
    onDone?: () => void;
    bold?: boolean;
}) {
    const { displayText, isDone } = useTypewriter({
        text,
        speed,
        startDelay,
        inView: enabled,
    });

    const calledRef = useRef(false);
    useEffect(() => {
        if (isDone && !calledRef.current) {
            calledRef.current = true;
            onDone?.();
        }
    }, [isDone, onDone]);

    const colors = {
        white: "text-[var(--term-white)]",
        green: "text-[var(--term-green)]",
        muted: "text-[var(--term-muted)]",
        yellow: "text-[var(--term-yellow)]",
    } as const;

    return (
        <div className={`${colors[color]} ${bold ? "font-semibold" : ""} min-h-[1.7em]`}>
            {displayText}
            {enabled && !isDone && <CursorBlink />}
        </div>
    );
}

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

    const [step, setStep] = useState(0);
    const next = () => setStep((s) => s + 1);

    // Once everything has typed, gate reveal of CTAs.
    const buttonsVisible = step >= 7;

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen bg-[var(--term-bg)] flex flex-col items-center justify-center px-4 sm:px-6 py-20"
        >
            {/* Faint background grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, var(--term-border) 1px, transparent 1px), linear-gradient(to bottom, var(--term-border) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />

            <div className="relative w-full max-w-2xl mx-auto">
                <TerminalWindow
                    title="debugx — ready to start"
                    accent="green"
                    bodyClassName="font-term text-[13.5px] leading-[1.9] min-h-[300px]"
                >
                    {inView && (
                        <TypeLine
                            text="$ debugx --signup"
                            color="green"
                            enabled={inView}
                            startDelay={200}
                            onDone={next}
                        />
                    )}

                    {step >= 1 && (
                        <TypeLine
                            text="[✓] account: free forever"
                            color="white"
                            startDelay={150}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 2 && (
                        <TypeLine
                            text="[✓] cards required: 0"
                            color="white"
                            startDelay={120}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 3 && (
                        <TypeLine
                            text="[✓] setup time: ~12 seconds"
                            color="white"
                            startDelay={120}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 4 && (
                        <TypeLine
                            text="[✓] AI feedback: enabled"
                            color="white"
                            startDelay={120}
                            enabled
                            onDone={next}
                        />
                    )}

                    {step >= 5 && <div className="h-[1em]" />}

                    {step >= 5 && (
                        <TypeLine
                            text="Stop guessing what's broken."
                            color="green"
                            speed={28}
                            startDelay={250}
                            bold
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 6 && (
                        <TypeLine
                            text="Start understanding why."
                            color="green"
                            speed={28}
                            startDelay={120}
                            bold
                            enabled
                            onDone={next}
                        />
                    )}

                    {step >= 7 && (
                        <div className="mt-2 text-[var(--term-green)] flex items-center">
                            <span>$ </span>
                            <CursorBlink />
                        </div>
                    )}
                </TerminalWindow>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={buttonsVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-term text-[13px]"
                >
                    {/* Primary — pulsing glow */}
                    <div className="relative">
                        <span
                            aria-hidden
                            className="absolute inset-0 rounded-[4px] pulse-ring pointer-events-none"
                        />
                        <MagneticNextLink
                            href="/signup"
                            className="relative inline-flex items-center justify-center px-7 py-3.5 bg-[var(--term-green)] text-[var(--term-bg)] font-semibold border border-[var(--term-green)] hover:bg-[var(--term-green-dim)] transition-colors duration-200"
                            radius={120}
                            strength={0.5}
                        >
                            [&nbsp;&nbsp;Create free account&nbsp;&nbsp;]
                        </MagneticNextLink>
                    </div>

                    <MagneticNextLink
                        href="/problems"
                        className="inline-flex items-center justify-center px-6 py-3.5 border border-[var(--term-border)] text-[var(--term-muted)] bg-transparent hover:border-[var(--term-white)] hover:text-[var(--term-white)] transition-colors duration-200"
                        radius={80}
                        strength={0.3}
                    >
                        [&nbsp;&nbsp;Browse problems&nbsp;&nbsp;]
                    </MagneticNextLink>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={buttonsVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 text-center text-[12px] text-[var(--term-muted)] font-term tracking-wide"
                >
                    # no credit card. no setup. just code.
                </motion.p>
            </div>

            {/* Footer */}
            <footer className="relative mt-24 w-full max-w-6xl mx-auto px-4 sm:px-6">
                <div className="border-t border-[var(--term-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-term text-[11px] text-[var(--term-muted)]">
                    <div className="flex items-center gap-2">
                        <span className="text-[var(--term-green)]">debugx</span>
                        <span>@v1.0</span>
                        <span className="cursor-blink text-[var(--term-green)]">_</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 tracking-wide">
                        <a href="/privacy" className="hover:text-[var(--term-white)] transition-colors">privacy</a>
                        <a href="/terms" className="hover:text-[var(--term-white)] transition-colors">terms</a>
                        <span>© 2026 — built by Abhiraj &amp; Tuhin</span>
                    </div>
                </div>
            </footer>
        </section>
    );
}
