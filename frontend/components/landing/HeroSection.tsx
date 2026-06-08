"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import TerminalWindow, { CursorBlink, TermPrompt } from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";
import { MagneticNextLink } from "./MagneticLink";

const SPEED = 28;

/* A line that types itself, then calls onDone when finished */
function TypeLine({
    text,
    color = "white",
    speed = SPEED,
    startDelay = 0,
    enabled,
    onDone,
    bold = false,
    className = "",
}: {
    text: string;
    color?: "white" | "green" | "muted" | "red" | "yellow";
    speed?: number;
    startDelay?: number;
    enabled: boolean;
    onDone?: () => void;
    bold?: boolean;
    className?: string;
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
        red: "text-[var(--term-red)]",
        yellow: "text-[var(--term-yellow)]",
    } as const;

    return (
        <div className={`${colors[color]} ${bold ? "font-semibold" : ""} ${className} min-h-[1.7em]`}>
            {displayText}
            {enabled && !isDone && <CursorBlink />}
        </div>
    );
}

export default function HeroSection() {
    // chain of line indices — each line waits for previous to finish
    const [step, setStep] = useState(0);
    const next = () => setStep((s) => s + 1);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
            <div className="w-full max-w-3xl mx-auto">
                <TerminalWindow title="debugx — zsh — 80x24" bodyClassName="font-term text-[13.5px] leading-[1.85] min-h-[420px]">
                    {/* Line 1 — prompt, instant */}
                    <div className="text-[var(--term-muted)]">
                        <TermPrompt path="~/dev/your-journey" />
                    </div>

                    {/* Line 2 — command */}
                    {step >= 0 && (
                        <TypeLine
                            text="debugx --start"
                            color="green"
                            enabled={step >= 0}
                            startDelay={400}
                            onDone={next}
                        />
                    )}

                    {step >= 1 && (
                        <TypeLine text="Initializing DebugX..." color="white" enabled startDelay={200} onDone={next} />
                    )}

                    {step >= 2 && (
                        <TypeLine
                            text="[✓] Loading problems database............. done"
                            color="white"
                            speed={18}
                            startDelay={150}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 3 && (
                        <TypeLine
                            text="[✓] Connecting AI engine.................. done"
                            color="white"
                            speed={18}
                            startDelay={150}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 4 && (
                        <TypeLine
                            text="[✓] Calibrating code visualizer........... done"
                            color="white"
                            speed={18}
                            startDelay={150}
                            enabled
                            onDone={next}
                        />
                    )}

                    {step >= 5 && (
                        <TypeLine
                            text="Welcome. Let's fix how you learn to code."
                            color="green"
                            speed={26}
                            startDelay={300}
                            bold
                            enabled
                            onDone={next}
                        />
                    )}

                    {step >= 6 && <div className="h-[1.7em]" />}

                    {step >= 6 && (
                        <TypeLine
                            text="You've been staring at the same bug for 3 hours."
                            color="white"
                            speed={22}
                            startDelay={250}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 7 && (
                        <TypeLine
                            text="# Stack Overflow: 47 tabs. ChatGPT: code that doesn't run."
                            color="muted"
                            speed={16}
                            startDelay={120}
                            enabled
                            onDone={next}
                        />
                    )}
                    {step >= 8 && (
                        <TypeLine
                            text="# You just want to know WHY it's broken."
                            color="muted"
                            speed={16}
                            startDelay={120}
                            enabled
                            onDone={next}
                        />
                    )}

                    {step >= 9 && <div className="h-[1.7em]" />}

                    {step >= 9 && (
                        <div className="text-[var(--term-green)] flex items-center">
                            <span>$ </span>
                            <CursorBlink />
                        </div>
                    )}
                </TerminalWindow>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 font-term text-[13px]"
                >
                    <MagneticNextLink
                        href="/signup"
                        className="group inline-flex items-center justify-center px-5 py-3 border border-[var(--term-green)] text-[var(--term-green)] bg-[var(--term-bg)] hover:bg-[var(--term-green)] hover:text-[var(--term-bg)] transition-colors duration-200"
                        radius={90}
                        strength={0.4}
                    >
                        [&nbsp;&nbsp;$ debugx --signup&nbsp;&nbsp;]
                    </MagneticNextLink>

                    <MagneticNextLink
                        href="#problem"
                        className="inline-flex items-center justify-center px-5 py-3 border border-[var(--term-border)] text-[var(--term-muted)] bg-transparent hover:border-[var(--term-white)] hover:text-[var(--term-white)] transition-colors duration-200"
                        radius={70}
                        strength={0.28}
                    >
                        [&nbsp;&nbsp;$ learn more&nbsp;&nbsp;]
                    </MagneticNextLink>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 pulse-fade font-term text-[11px] tracking-[0.2em] uppercase text-[var(--term-muted)] flex flex-col items-center gap-1">
                scroll to continue
                <span className="text-[var(--term-green)]">↓</span>
            </div>
        </section>
    );
}
