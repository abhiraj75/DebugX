"use client";

import { useRef } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useTransform,
} from "motion/react";
import TerminalWindow, { TermLine } from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";

/* ---------- 3D tilt wrapper ---------- */
function TiltShell({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const rotateY = useTransform(x, [0, 1], [-8, 8]);
    const rotateX = useTransform(y, [0, 1], [6, -6]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={(e) => {
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                x.set((e.clientX - r.left) / r.width);
                y.set((e.clientY - r.top) / r.height);
            }}
            onMouseLeave={() => {
                x.set(0.5);
                y.set(0.5);
            }}
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="will-change-transform"
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
        >
            {children}
        </motion.div>
    );
}

const CODE_LINES = [
    { num: 1, text: "def find_max(arr):", bug: false },
    { num: 2, text: "    return arr[0]", bug: true },
    { num: 3, text: "", bug: false },
    { num: 4, text: "result = find_max([])", bug: false },
    { num: 5, text: "print(result)", bug: false },
];

const AI_RESPONSE = `Analyzing your submission...

[AI] Found 1 critical issue:

Line 2: arr[0] assumes the array
is never empty. When find_max([])
is called, arr has no index 0.

Fix:
def find_max(arr):
    if not arr:
        return None
    return arr[0]

Why this matters:
Always validate inputs before
accessing array indices. This is
one of the most common Python bugs.

Confidence: 98.7%
Powered by AI ✓`;

export default function AIFeedbackSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

    const headline = useTypewriter({
        text: 'debugx --explain "why did my code fail?"',
        speed: 25,
        inView,
        startDelay: 100,
    });

    const ai = useTypewriter({
        text: AI_RESPONSE,
        speed: 14,
        inView: headline.isDone,
        startDelay: 200,
    });

    const turnpoint = useTypewriter({
        text: "Not just wrong. Exactly why.",
        speed: 45,
        inView: ai.isDone,
        startDelay: 400,
    });

    return (
        <section
            id="ai-feedback"
            ref={sectionRef}
            className="relative bg-[var(--term-bg)] py-32 px-5 sm:px-8 scroll-mt-20"
        >
            <div className="mx-auto max-w-7xl">
                {/* Headline */}
                <div className="mb-12 text-[18px] sm:text-2xl">
                    <span className="text-[var(--term-muted)]">$ </span>
                    <span className="text-[var(--term-green)]">{headline.displayText}</span>
                    {!headline.isDone && (
                        <span className="cursor-blink text-[var(--term-green)]">█</span>
                    )}
                </div>

                {/* Two terminals side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TiltShell>
                        <TerminalWindow
                            title="your_solution.py"
                            bodyClassName="min-h-[420px] text-[13px] leading-[1.9]"
                        >
                            <div className="font-mono">
                                {CODE_LINES.map((line) => (
                                    <div
                                        key={line.num}
                                        className={`flex relative ${
                                            line.bug
                                                ? "border-l-2 border-[var(--term-yellow)] -ml-6 pl-6 bg-[rgba(255,204,0,0.05)]"
                                                : ""
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-8 text-right pr-3 select-none ${
                                                line.bug
                                                    ? "text-[var(--term-yellow)]"
                                                    : "text-[var(--term-muted)]"
                                            }`}
                                        >
                                            {line.num}
                                        </span>
                                        <span
                                            className={
                                                line.bug ? "text-[var(--term-yellow)]" : "text-[var(--term-white)]"
                                            }
                                        >
                                            {line.text || " "}
                                        </span>
                                    </div>
                                ))}

                                <div className="mt-6 pt-4 border-t border-[var(--term-border)] space-y-1">
                                    <TermLine color="red">
                                        [✗] IndexError: list index out of range
                                    </TermLine>
                                    <TermLine color="red">
                                        [✗] Failed on: find_max([]) — empty array edge case
                                    </TermLine>
                                </div>
                            </div>
                        </TerminalWindow>
                    </TiltShell>

                    <TiltShell>
                        <TerminalWindow
                            title="ai — feedback"
                            accent="purple"
                            bodyClassName="min-h-[420px] text-[13px] leading-[1.85]"
                        >
                            <pre className="font-mono whitespace-pre-wrap text-[var(--term-white)]">
                                {ai.displayText}
                                {!ai.isDone && headline.isDone && (
                                    <span className="cursor-blink text-[var(--term-purple)]">█</span>
                                )}
                            </pre>
                        </TerminalWindow>
                    </TiltShell>
                </div>

                {/* Turning point line */}
                <div className="mt-16 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--term-green)]">
                        {turnpoint.displayText}
                        {!turnpoint.isDone && ai.isDone && (
                            <span className="cursor-blink">█</span>
                        )}
                    </h2>
                </div>
            </div>
        </section>
    );
}
