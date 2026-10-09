"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";

const CODE = [
    "def bubble_sort(arr):",
    "    n = len(arr)",
    "    for i in range(n):",
    "        for j in range(n-i-1):",
    "            if arr[j] > arr[j+1]:",
    "                arr[j], arr[j+1] = arr[j+1], arr[j]",
    "    return arr",
];

type Step = { arr: { id: number; v: number }[]; i: number; j: number; line: number; out: string; hot: number[] };

/** Full bubble-sort trace: one step per compare, one per swap. */
function trace(input: number[]): Step[] {
    const arr = input.map((v, id) => ({ id, v }));
    const steps: Step[] = [];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            const a = arr[j].v;
            const b = arr[j + 1].v;
            steps.push({ arr: [...arr], i, j, line: 4, out: `compare arr[${j}]=${a} > arr[${j + 1}]=${b} → ${a > b}`, hot: [j, j + 1] });
            if (a > b) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                steps.push({ arr: [...arr], i, j, line: 5, out: `swap ${a} ↔ ${b}`, hot: [j, j + 1] });
            }
        }
    }
    steps.push({ arr: [...arr], i: n, j: 0, line: 6, out: "return arr  ✓ sorted", hot: [] });
    return steps;
}

const INPUT = [5, 3, 8, 1, 9, 2];
const MAX = Math.max(...INPUT);

function Stage({ step, idx, total }: { step: Step; idx: number; total: number }) {
    return (
        <div className="grid w-full gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="overflow-x-auto rounded-3xl border border-[var(--n-line)] bg-[var(--n-surface)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4 font-code text-[11px] leading-[1.75] sm:py-5 sm:text-[13.5px] sm:leading-[2]">
                {CODE.map((l, n) => (
                    <div
                        key={n}
                        className="relative whitespace-pre px-5 transition-colors duration-300"
                        style={{ color: n === step.line ? "#050507" : "#9a9aab" }}
                    >
                        {n === step.line && (
                            <motion.span layoutId="hl" className="absolute inset-0 bg-[var(--n-lime)]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                        )}
                        <span className="relative mr-4 opacity-50">{n + 1}</span>
                        <span className="relative">{l}</span>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-[var(--n-line)] bg-[var(--n-surface)] p-4 sm:gap-4 sm:p-6">
                <div className="flex items-center justify-between font-code text-[11px] uppercase tracking-[0.2em] text-[var(--n-muted)]">
                    <span>live state</span>
                    <span className="tabular-nums">step {String(idx + 1).padStart(2, "0")}/{total}</span>
                </div>
                <div className="flex h-28 gap-2 sm:h-56">
                    {step.arr.map((c, k) => {
                        const hot = step.hot.includes(k);
                        return (
                            <motion.div
                                key={c.id}
                                layout
                                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                                className="flex flex-1 flex-col items-center gap-2"
                            >
                                <span className="font-code text-sm" style={{ color: hot ? "var(--n-lime)" : "var(--n-text)" }}>{c.v}</span>
                                <div className="flex w-full flex-1 items-end">
                                <div
                                    className="w-full rounded-t-lg transition-colors duration-300"
                                    style={{
                                        height: `${(c.v / MAX) * 100}%`,
                                        minHeight: 12,
                                        background: hot ? "var(--n-lime)" : step.line === 6 ? "var(--n-violet)" : "#2a2a38",
                                        boxShadow: hot ? "0 0 30px rgba(198,255,61,0.45)" : "none",
                                    }}
                                />
                                </div>
                                <span className="font-code text-[10px] text-[var(--n-muted)]">[{k}]</span>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="flex gap-3 font-code text-sm">
                    {[["i", step.i], ["j", step.j], ["n", INPUT.length]].map(([k, v]) => (
                        <span key={k} className="rounded-full border border-[var(--n-line)] px-3 py-1">
                            {k} = <span className="text-[var(--n-lime)] tabular-nums">{v}</span>
                        </span>
                    ))}
                </div>
                <div className="rounded-xl bg-black/40 px-4 py-3 font-code text-[12px] text-[#b8b8c6]" aria-live="polite">
                    <span className="text-[var(--n-muted)]">stdout › </span>
                    {step.out}
                </div>
            </div>
        </div>
    );
}

export default function VisualizerScene() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    const steps = useMemo(() => trace(INPUT), []);
    const [idx, setIdx] = useState(0);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const rail = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const p = Math.min(1, Math.max(0, (v - 0.1) / 0.8));
        setIdx(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    });

    const heading = (
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="mb-4 font-code text-[11px] uppercase tracking-[0.3em] text-[var(--n-lime)]">02 — visualizer</p>
                <h2 className="font-display text-[clamp(34px,5.5vw,84px)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
                    Watch every
                    <br />
                    variable <span className="shimmer-text">move.</span>
                </h2>
            </div>
            <p className="hidden max-w-sm text-[var(--n-muted)] sm:block">
                Scroll to step through a real bubble sort. See what each line does and never guess what your loop is doing again.
            </p>
        </div>
    );

    if (reduced) {
        return (
            <section id="visualizer" ref={ref} className="mx-auto max-w-[1400px] px-4 py-32 sm:px-8">
                {heading}
                <label className="mb-6 flex items-center gap-4 font-code text-sm text-[var(--n-muted)]">
                    step
                    <input type="range" min={0} max={steps.length - 1} value={idx} onChange={(e) => setIdx(+e.target.value)} className="w-full accent-[#c6ff3d]" />
                </label>
                <Stage step={steps[idx]} idx={idx} total={steps.length} />
            </section>
        );
    }

    return (
        <section id="visualizer" ref={ref} className="relative h-[380vh]">
            <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
                <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
                    {heading}
                    <Stage step={steps[idx]} idx={idx} total={steps.length} />
                    <div className="mt-6 h-px w-full bg-[var(--n-line)]">
                        <motion.div className="h-px bg-[var(--n-lime)] shadow-[0_0_12px_var(--n-lime)]" style={{ width: rail }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
