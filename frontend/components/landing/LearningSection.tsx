"use client";

import { useRef } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";
import TerminalWindow from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";

type ModuleState = "done" | "doing" | "locked";

interface Module {
    n: number;
    title: string;
    desc: string;
    state: ModuleState;
}

const MODULES: Module[] = [
    { n: 1, title: "Variables & Types", desc: "ints, strs, bools, dicts.", state: "done" },
    { n: 2, title: "Control Flow", desc: "if / else / for / while.", state: "done" },
    { n: 3, title: "Functions", desc: "def, args, return, scope.", state: "done" },
    { n: 4, title: "Recursion", desc: "the base case is sacred.", state: "doing" },
    { n: 5, title: "Lists & Tuples", desc: "slicing, mutating, packing.", state: "locked" },
    { n: 6, title: "Dictionaries", desc: "hash maps under the hood.", state: "locked" },
    { n: 7, title: "Classes & OOP", desc: "self, methods, inheritance.", state: "locked" },
    { n: 8, title: "Generators", desc: "yield, lazy iteration.", state: "locked" },
    { n: 9, title: "Async Python", desc: "asyncio, await, event loop.", state: "locked" },
];

const STATE_BADGE: Record<ModuleState, { mark: string; label: string; color: string; border: string }> = {
    done: {
        mark: "[✓]",
        label: "completed",
        color: "text-[var(--term-green)]",
        border: "border-[var(--term-green)]",
    },
    doing: {
        mark: "[~]",
        label: "in progress",
        color: "text-[var(--term-yellow)]",
        border: "border-[var(--term-yellow)]",
    },
    locked: {
        mark: "[░]",
        label: "locked",
        color: "text-[var(--term-muted)]",
        border: "border-[var(--term-border)]",
    },
};

function ModuleCard({ mod, index, inView }: { mod: Module; index: number; inView: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0.5);
    const my = useMotionValue(0.5);
    const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 220, damping: 20 });
    const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 220, damping: 20 });

    const badge = STATE_BADGE[mod.state];
    const dim = mod.state === "locked";

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
    };
    const onLeave = () => {
        mx.set(0.5);
        my.set(0.5);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.06,
                ease: [0.16, 1, 0.3, 1],
            }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] will-change-transform"
        >
            <div
                className={`relative h-[200px] bg-[var(--term-bg-card)] border ${badge.border} rounded-[4px] overflow-hidden p-5 ${
                    dim ? "opacity-60" : ""
                }`}
            >
                {/* Top row: mark + module index */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono text-[13px] ${badge.color}`}>{badge.mark}</span>
                    <span className="font-mono text-[11px] text-[var(--term-muted)] tracking-[0.2em]">
                        module {String(mod.n).padStart(2, "0")}
                    </span>
                </div>

                {/* Title */}
                <div
                    className={`text-[15px] font-semibold leading-snug mb-2 ${
                        dim ? "text-[var(--term-muted)]" : "text-[var(--term-white)]"
                    }`}
                >
                    {mod.title}
                </div>

                {/* Description */}
                <div className="text-[12px] text-[var(--term-muted)] leading-relaxed">
                    # {mod.desc}
                </div>

                {/* Bottom row: state label */}
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[11px] font-mono">
                    <span className={`uppercase tracking-[0.2em] ${badge.color}`}>{badge.label}</span>
                    {mod.state === "doing" && (
                        <span className="text-[var(--term-muted)]">[████░░░░░░]</span>
                    )}
                    {mod.state === "done" && (
                        <span className="text-[var(--term-green)]">[██████████]</span>
                    )}
                    {mod.state === "locked" && (
                        <span className="text-[var(--term-muted)]">[░░░░░░░░░░]</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function LearningSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-120px 0px" });

    const headline = useTypewriter({
        text: "debugx --learning --track='python'",
        speed: 24,
        inView,
        startDelay: 100,
    });

    const subtitle = useTypewriter({
        text: "9 modules. 3 complete. 1 in progress. 5 locked.",
        speed: 22,
        inView: headline.isDone,
        startDelay: 200,
    });

    const done = MODULES.filter((m) => m.state === "done").length;
    const total = MODULES.length;
    const pct = Math.round((done / total) * 100);
    const bars = Math.round((done / total) * 20);

    return (
        <section
            ref={sectionRef}
            className="relative bg-[var(--term-bg)] py-28 sm:py-32 overflow-hidden"
        >
            <div className="px-5 sm:px-8 mb-10 max-w-7xl mx-auto">
                {/* Headline */}
                <div className="mb-3 text-[18px] sm:text-2xl">
                    <span className="text-[var(--term-muted)]">$ </span>
                    <span className="text-[var(--term-green)]">{headline.displayText}</span>
                    {!headline.isDone && (
                        <span className="cursor-blink text-[var(--term-green)]">█</span>
                    )}
                </div>
                <div className="text-[13px] text-[var(--term-muted)] min-h-[1.4em]">
                    # {subtitle.displayText}
                    {!subtitle.isDone && headline.isDone && (
                        <span className="cursor-blink text-[var(--term-muted)]">_</span>
                    )}
                </div>

                {/* Progress meta */}
                <div className="mt-5 font-mono text-[12px] text-[var(--term-muted)]">
                    progress:{" "}
                    <span className="text-[var(--term-green)]">
                        {"█".repeat(bars)}
                    </span>
                    <span className="text-[var(--term-border)]">{"░".repeat(20 - bars)}</span>{" "}
                    <span className="text-[var(--term-white)]">{done}/{total}</span>{" "}
                    <span className="text-[var(--term-green)]">({pct}%)</span>
                </div>
            </div>

            {/* Horizontal rail */}
            <div className="no-scrollbar overflow-x-auto snap-x snap-mandatory">
                <div className="flex gap-4 px-5 sm:px-8 pb-6 pt-2 min-w-max">
                    {MODULES.map((m, i) => (
                        <ModuleCard key={m.n} mod={m} index={i} inView={inView} />
                    ))}
                </div>
            </div>

            <div className="mt-6 px-5 sm:px-8 text-center text-[11px] tracking-[0.2em] uppercase text-[var(--term-muted)]">
                ← scroll horizontally →
            </div>
        </section>
    );
}
