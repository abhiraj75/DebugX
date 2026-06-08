"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import TerminalWindow from "@/components/ui/TerminalWindow";
import { useTypewriter } from "@/components/ui/useTypewriter";

/* ---------- Count-up hook ---------- */
function useCountUp(target: number, durationMs: number, run: boolean) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!run) return;
        const reduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            setValue(target);
            return;
        }
        const t0 = performance.now();
        let raf = 0;
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / durationMs);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs, run]);
    return value;
}

function StatTile({
    label,
    value,
    suffix = "",
    durationMs = 1400,
    run,
    decimals = 0,
    raw,
}: {
    label: string;
    value: number;
    suffix?: string;
    durationMs?: number;
    run: boolean;
    decimals?: number;
    raw?: string; // optional override (for "<2s")
}) {
    const v = useCountUp(value, durationMs, run);
    const display = raw
        ? raw
        : decimals > 0
            ? v.toFixed(decimals)
            : v.toLocaleString();

    return (
        <TerminalWindow title={`${label}.stat`} compact bodyClassName="text-[13px]">
            <div className="text-[11px] tracking-[0.18em] uppercase text-[var(--term-muted)] mb-2">
                {label}
            </div>
            <div className="font-mono text-3xl sm:text-4xl text-[var(--term-green)] tabular-nums">
                {display}
                {suffix && <span className="text-[var(--term-muted)] text-base ml-1">{suffix}</span>}
            </div>
        </TerminalWindow>
    );
}

/* ---------- Heatmap ---------- */
// 7 rows x 26 cols (compact landing-page heatmap)
const HEATMAP_ROWS = 7;
const HEATMAP_COLS = 26;

function buildHeatmap() {
    const cells: number[] = [];
    for (let i = 0; i < HEATMAP_ROWS * HEATMAP_COLS; i++) {
        const r = Math.random();
        // weighted: lots of empty, some light, fewer dense
        if (r < 0.45) cells.push(0);
        else if (r < 0.7) cells.push(1);
        else if (r < 0.88) cells.push(2);
        else cells.push(3);
    }
    return cells;
}

const HEAT_COLOR = [
    "bg-[var(--term-bg-secondary)]",
    "bg-[rgba(0,255,136,0.18)]",
    "bg-[rgba(0,255,136,0.5)]",
    "bg-[var(--term-green)]",
];

/* ---------- Leaderboard mock ---------- */
const LEADERS = [
    { rank: 1, name: "@priya_codes", solved: 312, you: false },
    { rank: 2, name: "@debug_king", solved: 287, you: false },
    { rank: 3, name: "@async_alex", solved: 261, you: false },
    { rank: 4, name: "@looplord", solved: 244, you: false },
    { rank: 5, name: "@you", solved: 198, you: true },
    { rank: 6, name: "@kernel_sam", solved: 176, you: false },
];

export default function StatsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-120px 0px" });

    const headline = useTypewriter({
        text: "debugx --stats --user='you'",
        speed: 24,
        inView,
        startDelay: 100,
    });

    // Re-roll heatmap once when the section enters view
    const [heatmap, setHeatmap] = useState<number[]>([]);
    useEffect(() => {
        if (inView && heatmap.length === 0) setHeatmap(buildHeatmap());
    }, [inView, heatmap.length]);

    // Streak progress
    const streakDay = useCountUp(47, 1400, inView);
    const streakBars = Math.round((streakDay / 60) * 20);
    const streakPct = Math.round((streakDay / 60) * 100);

    return (
        <section
            id="stats"
            ref={sectionRef}
            className="relative bg-[var(--term-bg)] py-28 sm:py-32 px-5 sm:px-8 scroll-mt-20"
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

                {/* Stat tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <StatTile label="problems_solved" value={2847} run={inView} />
                    <StatTile label="active_learners" value={1204} run={inView} />
                    <StatTile label="ai_responses" value={48391} run={inView} />
                    <StatTile label="feedback_time" value={0} run={inView} raw="<2s" />
                </div>

                {/* Heatmap + Streak + Leaderboard */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
                    {/* Heatmap + streak */}
                    <div className="space-y-5">
                        <TerminalWindow
                            title="contributions.heatmap — last 26 weeks"
                            bodyClassName="text-[13px]"
                        >
                            <div className="flex gap-[3px]">
                                {Array.from({ length: HEATMAP_COLS }).map((_, col) => (
                                    <div key={col} className="flex flex-col gap-[3px]">
                                        {Array.from({ length: HEATMAP_ROWS }).map((_, row) => {
                                            const idx = col * HEATMAP_ROWS + row;
                                            const level = heatmap[idx] ?? 0;
                                            return (
                                                <motion.div
                                                    key={row}
                                                    initial={{ opacity: 0, scale: 0.6 }}
                                                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                                                    transition={{
                                                        duration: 0.25,
                                                        delay: 0.4 + idx * 0.0015,
                                                        ease: "easeOut",
                                                    }}
                                                    className={`w-[12px] h-[12px] rounded-[2px] ${HEAT_COLOR[level]}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--term-muted)]">
                                <span>less</span>
                                {HEAT_COLOR.map((c, i) => (
                                    <span key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
                                ))}
                                <span>more</span>
                            </div>
                        </TerminalWindow>

                        <TerminalWindow title="streak.bar" bodyClassName="text-[13px]" compact>
                            <div className="text-[var(--term-muted)] text-[11px] uppercase tracking-[0.2em] mb-2">
                                current streak
                            </div>
                            <div className="font-mono text-[var(--term-white)]">
                                {streakDay} / 60 days{" "}
                                <span className="text-[var(--term-muted)]">[</span>
                                <span className="text-[var(--term-green)]">
                                    {"█".repeat(streakBars)}
                                </span>
                                <span className="text-[var(--term-muted)]">
                                    {"░".repeat(20 - streakBars)}
                                </span>
                                <span className="text-[var(--term-muted)]">]</span>{" "}
                                <span className="text-[var(--term-green)]">{streakPct}%</span>
                            </div>
                            <div className="mt-2 text-[var(--term-muted)] text-[12px]">
                                # don&apos;t break the chain.
                            </div>
                        </TerminalWindow>
                    </div>

                    {/* Leaderboard */}
                    <TerminalWindow
                        title="leaderboard.top"
                        bodyClassName="text-[13px]"
                    >
                        <div className="text-[var(--term-muted)] text-[11px] uppercase tracking-[0.2em] mb-3">
                            top contributors — week 24
                        </div>
                        <div className="font-mono space-y-1">
                            {LEADERS.map((l, i) => {
                                const color = l.you
                                    ? "text-[var(--term-green)]"
                                    : l.rank === 1
                                        ? "text-[var(--term-yellow)]"
                                        : "text-[var(--term-white)]";
                                return (
                                    <motion.div
                                        key={l.name}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={inView ? { opacity: 1, x: 0 } : {}}
                                        transition={{
                                            duration: 0.35,
                                            delay: 0.5 + i * 0.06,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className={`flex items-center justify-between px-2 py-1 ${
                                            l.you ? "bg-[rgba(0,255,136,0.06)] border-l-2 border-[var(--term-green)] -ml-2 pl-2" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[var(--term-muted)] w-6 text-right">
                                                {String(l.rank).padStart(2, "0")}.
                                            </span>
                                            <span className={color}>{l.name}</span>
                                        </div>
                                        <span className={`${color} tabular-nums`}>
                                            {l.solved}
                                            <span className="text-[var(--term-muted)] ml-1 text-[11px]">solved</span>
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </TerminalWindow>
                </div>
            </div>
        </section>
    );
}
