"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import TerminalWindow, { TermLine } from "@/components/ui/TerminalWindow";

const BEATS = [
    {
        leftText: "You submit your code.",
        title: "judge@debugx — output",
        lines: [
            { text: "Running test cases...", color: "muted" as const },
            { text: "Test 1/10 ✓  Test 2/10 ✓  Test 3/10 ✗", color: "muted" as const },
            { text: "", color: "muted" as const },
            { text: "Result: WRONG_ANSWER", color: "red" as const },
            { text: "Score: 20 / 100", color: "red" as const },
        ],
    },
    {
        leftText: "You try again. And again.",
        title: "judge@debugx — output",
        lines: [
            { text: "Attempt 4 ✗  Attempt 5 ✗  Attempt 6 ✗", color: "red" as const },
            { text: "", color: "muted" as const },
            { text: "# what is even wrong???", color: "muted" as const },
        ],
    },
    {
        leftText: "Most platforms stop here.",
        title: "judge@debugx — output",
        lines: [
            { text: "Result: WRONG_ANSWER", color: "red" as const },
            { text: "", color: "muted" as const },
            { text: "# no hint. no fix.", color: "muted" as const },
            { text: "# you're on your own.", color: "muted" as const },
        ],
    },
];

export default function ProblemSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Non-overlapping fades. Hard step function so no beat ever bleeds outside its window.
    const beat0Opacity = useTransform(scrollYProgress, (v) => {
        if (v < 0.30) return 1;
        if (v < 0.33) return 1 - (v - 0.30) / 0.03;
        return 0;
    });
    const beat1Opacity = useTransform(scrollYProgress, (v) => {
        if (v < 0.33) return 0;
        if (v < 0.36) return (v - 0.33) / 0.03;
        if (v < 0.63) return 1;
        if (v < 0.66) return 1 - (v - 0.63) / 0.03;
        return 0;
    });
    const beat2Opacity = useTransform(scrollYProgress, (v) => {
        if (v < 0.66) return 0;
        if (v < 0.69) return (v - 0.66) / 0.03;
        return 1;
    });

    const finalLineOpacity = useTransform(scrollYProgress, (v) => {
        if (v < 0.85) return 0;
        if (v < 0.95) return (v - 0.85) / 0.10;
        return 1;
    });

    return (
        <section id="problem" ref={containerRef} className="relative h-[300vh] bg-[var(--term-bg)] scroll-mt-20">
            <div className="sticky top-0 h-screen flex items-center px-5 sm:px-8">
                <div className="mx-auto max-w-7xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-8 md:gap-12 items-center">
                        {/* Left — beat labels */}
                        <div className="relative min-h-[80px]">
                            {BEATS.map((b, i) => {
                                const opacity =
                                    i === 0 ? beat0Opacity : i === 1 ? beat1Opacity : beat2Opacity;
                                return (
                                    <motion.div
                                        key={i}
                                        style={{ opacity }}
                                        className="absolute inset-0 flex flex-col justify-center"
                                    >
                                        <span className="text-[11px] tracking-[0.25em] text-[var(--term-muted)] mb-3">
                                            beat 0{i + 1}
                                        </span>
                                        <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--term-white)] leading-[1.15]">
                                            {b.leftText}
                                        </h2>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Right — terminal evolves */}
                        <div className="relative min-h-[240px]">
                            {BEATS.map((b, i) => {
                                const opacity =
                                    i === 0 ? beat0Opacity : i === 1 ? beat1Opacity : beat2Opacity;
                                return (
                                    <motion.div
                                        key={i}
                                        style={{ opacity }}
                                        className="absolute inset-0"
                                    >
                                        <TerminalWindow
                                            title={b.title}
                                            bodyClassName="text-[13px] leading-[1.9]"
                                        >
                                            <div className="space-y-1">
                                                {b.lines.map((line, j) => (
                                                    <TermLine key={j} color={line.color}>
                                                        {line.text || " "}
                                                    </TermLine>
                                                ))}
                                            </div>
                                        </TerminalWindow>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Final reveal — own row, breathing room */}
                    <motion.div
                        style={{ opacity: finalLineOpacity }}
                        className="mt-14 text-center text-[var(--term-green)] text-base sm:text-lg tracking-wide"
                    >
                        <span className="text-[var(--term-muted)]">$ </span>
                        DebugX doesn&apos;t stop here.
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
