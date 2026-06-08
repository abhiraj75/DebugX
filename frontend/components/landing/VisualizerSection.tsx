"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import TerminalWindow, { TermLine } from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";

const CODE = [
    { n: 1, text: "def bubble_sort(arr):" },
    { n: 2, text: "    n = len(arr)" },
    { n: 3, text: "    for i in range(n):" },
    { n: 4, text: "        for j in range(n-i-1):" },
    { n: 5, text: "            if arr[j] > arr[j+1]:" },
    { n: 6, text: "                arr[j], arr[j+1] = arr[j+1], arr[j]" },
    { n: 7, text: "    return arr" },
];

/** Indexes of lines that the highlight cycles through (0-based -> line.n). */
const CYCLE = [2, 3, 4, 5]; // 1-based line numbers
const STEP_MS = 1500;

const STATES = [
    {
        arr: "[3, 1, 4, 1, 5]",
        i: 1,
        j: 1,
        stdout: ["Comparing arr[1] and arr[2]", "Already sorted: 1 < 4"],
        step: 3,
    },
    {
        arr: "[3, 1, 4, 1, 5]",
        i: 1,
        j: 2,
        stdout: ["Comparing arr[2] and arr[3]", "Swapping: 4 ↔ 1"],
        step: 4,
    },
    {
        arr: "[3, 1, 1, 4, 5]",
        i: 1,
        j: 3,
        stdout: ["Comparing arr[3] and arr[4]", "Already sorted: 4 < 5"],
        step: 5,
    },
    {
        arr: "[3, 1, 1, 4, 5]",
        i: 2,
        j: 0,
        stdout: ["Comparing arr[0] and arr[1]", "Swapping: 3 ↔ 1"],
        step: 6,
    },
];

const BULLETS = [
    "See every variable as it changes",
    "Understand exactly what each line does",
    "Never guess what your loop is doing again",
];

export default function VisualizerSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

    const headline = useTypewriter({
        text: 'debugx --visualize "bubble_sort.py"',
        speed: 25,
        inView,
        startDelay: 100,
    });

    const [cycleIdx, setCycleIdx] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const id = setInterval(() => {
            setCycleIdx((i) => (i + 1) % CYCLE.length);
        }, STEP_MS);
        return () => clearInterval(id);
    }, [inView]);

    const activeLine = CYCLE[cycleIdx];
    const state = STATES[cycleIdx];

    return (
        <section
            id="visualizer"
            ref={sectionRef}
            className="relative bg-[var(--term-bg)] py-32 px-5 sm:px-8 scroll-mt-20"
        >
            <div className="mx-auto max-w-6xl">
                {/* Headline */}
                <div className="mb-10 text-center text-[18px] sm:text-2xl">
                    <span className="text-[var(--term-muted)]">$ </span>
                    <span className="text-[var(--term-green)]">{headline.displayText}</span>
                    {!headline.isDone && (
                        <span className="cursor-blink text-[var(--term-green)]">█</span>
                    )}
                </div>

                <TerminalWindow
                    title={`visualizer@debugx — step ${state.step}/12`}
                    bodyClassName="p-0"
                >
                    <div className="grid grid-cols-1 md:grid-cols-[60%_40%] divide-y md:divide-y-0 md:divide-x divide-[var(--term-border)]">
                        {/* Code panel */}
                        <div className="p-6 font-mono text-[13px] leading-[2]">
                            {CODE.map((line) => {
                                const isActive = line.n === activeLine;
                                const isDim = !isActive && CYCLE.includes(line.n);
                                return (
                                    <motion.div
                                        key={line.n}
                                        animate={{
                                            backgroundColor: isActive
                                                ? "rgba(0,255,136,0.08)"
                                                : "rgba(0,0,0,0)",
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex relative ${
                                            isActive ? "border-l-2 border-[var(--term-green)]" : "border-l-2 border-transparent"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-10 text-right pr-3 pl-2 select-none ${
                                                isActive
                                                    ? "text-[var(--term-green)]"
                                                    : isDim
                                                    ? "text-[var(--term-muted)]"
                                                    : "text-[var(--term-muted)]"
                                            }`}
                                        >
                                            {line.n}
                                        </span>
                                        <span
                                            className={
                                                isActive
                                                    ? "text-[var(--term-green)]"
                                                    : isDim
                                                    ? "text-[var(--term-muted)]"
                                                    : "text-[var(--term-white)]"
                                            }
                                        >
                                            {line.text || " "}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Variables panel */}
                        <div className="p-6 text-[13px] leading-[1.9] bg-[var(--term-bg-secondary)]">
                            <div>
                                <div className="text-[var(--term-muted)] mb-2">
                                    — variables ——————————
                                </div>
                                <div className="space-y-1">
                                    <VarLine name="arr" value={state.arr} highlight={false} />
                                    <VarLine name="n" value="5" highlight={false} />
                                    <VarLine name="i" value={String(state.i)} highlight={false} />
                                    <VarLine name="j" value={String(state.j)} highlight />
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="text-[var(--term-muted)] mb-2">
                                    — stdout ——————————
                                </div>
                                {state.stdout.map((s, idx) => (
                                    <TermLine key={`${cycleIdx}-${idx}`} color="white">
                                        {s}
                                    </TermLine>
                                ))}
                            </div>

                            <div className="mt-5">
                                <div className="text-[var(--term-muted)] mb-2">
                                    — step ——————————
                                </div>
                                <div className="font-mono text-[var(--term-white)]">
                                    {state.step} / 12 [
                                    <span className="text-[var(--term-green)]">
                                        {"█".repeat(Math.round((state.step / 12) * 10))}
                                    </span>
                                    <span className="text-[var(--term-muted)]">
                                        {"░".repeat(10 - Math.round((state.step / 12) * 10))}
                                    </span>
                                    ] {Math.round((state.step / 12) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </TerminalWindow>

                {/* Bullets below */}
                <div className="mt-10 space-y-2 max-w-md mx-auto">
                    {BULLETS.map((b, i) => (
                        <motion.div
                            key={b}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{
                                duration: 0.5,
                                delay: 0.1 * i,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="text-[var(--term-muted)] text-[13px]"
                        >
                            <span className="text-[var(--term-green)]">[✓]</span> {b}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function VarLine({
    name,
    value,
    highlight,
}: {
    name: string;
    value: string;
    highlight: boolean;
}) {
    return (
        <div className="font-mono">
            <span className={highlight ? "text-[var(--term-green)]" : "text-[var(--term-white)]"}>
                {name.padEnd(6)}
            </span>
            <span className="text-[var(--term-muted)]">→ </span>
            <motion.span
                key={value}
                initial={{ opacity: 0.3, x: -2 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={highlight ? "text-[var(--term-green)]" : "text-[var(--term-white)]"}
            >
                {value}
            </motion.span>
        </div>
    );
}
