"use client";

import { ReactNode, useRef } from "react";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const MODULES = [
    ["Variables & Types", "done"],
    ["Control Flow", "done"],
    ["Functions", "done"],
    ["Recursion", "doing"],
    ["Lists & Tuples", "locked"],
    ["Dictionaries", "locked"],
    ["Classes & OOP", "locked"],
    ["Generators", "locked"],
    ["Async Python", "locked"],
] as const;

const AI_LINES = [
    { t: "[AI] Found 1 critical issue", c: "text-[var(--n-violet)]" },
    { t: "line 2: arr[0] assumes the array is never empty.", c: "text-[var(--n-text)]" },
    { t: "find_max([]) has no index 0 → IndexError.", c: "text-[#b8b8c6]" },
    { t: "+ if not arr: return None", c: "text-[var(--n-lime)]" },
    { t: "# validate inputs before indexing", c: "text-[var(--n-muted)]" },
];

/** Spotlight border + glow that tracks the cursor, with a slight 3D tilt. */
function Tile({ children, className = "", i }: { children: ReactNode; className?: string; i: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const onMove = (e: React.PointerEvent) => {
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        if (e.pointerType === "mouse")
            el.style.transform = `perspective(900px) rotateX(${(0.5 - y / r.height) * 4}deg) rotateY(${(x / r.width - 0.5) * 4}deg)`;
    };
    const onLeave = () => {
        const el = ref.current!;
        el.style.transform = "";
        el.style.setProperty("--mx", "-999px");
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            className={className}
        >
            <div
                ref={ref}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="spot flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-transform duration-200 ease-out sm:p-7"
            >
                {children}
            </div>
        </motion.div>
    );
}

const Label = ({ children }: { children: ReactNode }) => (
    <p className="mb-3 font-code text-[11px] uppercase tracking-[0.25em] text-[var(--n-muted)]">{children}</p>
);
const Title = ({ children }: { children: ReactNode }) => (
    <h3 className="font-display text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">{children}</h3>
);

export default function Bento() {
    return (
        <section id="features" className="mx-auto max-w-[1400px] px-4 py-32 sm:px-8 sm:py-40">
            <div className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-4 font-code text-[11px] uppercase tracking-[0.3em] text-[var(--n-lime)]">03 — features</p>
                    <h2 className="font-display text-[clamp(34px,5.5vw,84px)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
                        Built to make
                        <br />
                        it <span className="shimmer-text">click.</span>
                    </h2>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-6">
                <Tile i={0} className="lg:col-span-4 lg:row-span-2">
                    <Label>AI review</Label>
                    <Title>Not just wrong. Exactly why.</Title>
                    <div className="mb-6 mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--n-line)] bg-black/40 py-4 font-code text-[13px] leading-[1.9]">
                            <div className="px-4 text-[var(--n-muted)]">find_max.py</div>
                            <div className="whitespace-pre px-4"><span className="text-[#c792ea]">def</span> find_max(arr):</div>
                            <div className="whitespace-pre bg-[var(--n-red)]/10 px-4 shadow-[inset_2px_0_0_var(--n-red)]">    <span className="text-[#c792ea]">return</span> arr[0]</div>
                            <div className="whitespace-pre px-4"> </div>
                            <div className="whitespace-pre px-4">result = find_max([])</div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--n-violet)]/30 bg-[#0d0a18]/70 p-4 font-code text-[12.5px] leading-relaxed">
                            {AI_LINES.map((l, k) => (
                                <motion.span
                                    key={k}
                                    className={l.c}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + k * 0.25, duration: 0.5 }}
                                >
                                    {l.t}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-auto grid gap-px overflow-hidden rounded-2xl border border-[var(--n-line)] bg-[var(--n-line)] pt-0 sm:grid-cols-3 [&>*]:bg-[var(--n-surface)]">
                        {[
                            ["01", "Diagnose", "Points at the exact line that breaks."],
                            ["02", "Fix", "Shows the smallest change that works."],
                            ["03", "Understand", "Explains why, so you spot it next time."],
                        ].map(([n, t, d]) => (
                            <div key={n} className="p-4">
                                <span className="font-code text-[11px] text-[var(--n-lime)]">{n}</span>
                                <p className="mt-1 font-display text-sm font-bold">{t}</p>
                                <p className="mt-1 text-[13px] text-[var(--n-muted)]">{d}</p>
                            </div>
                        ))}
                    </div>
                </Tile>

                <Tile i={1} className="lg:col-span-2 lg:row-span-2">
                    <Label>Learning path</Label>
                    <Title>Variables to async, in order.</Title>
                    <ol className="relative mt-6 space-y-2.5 pl-6">
                        <span className="absolute bottom-2 left-[5px] top-2 w-px bg-[var(--n-line)]" />
                        <motion.span
                            className="absolute left-[5px] top-2 w-px origin-top bg-[var(--n-lime)]"
                            style={{ height: "36%" }}
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
                        />
                        {MODULES.map(([t, s], k) => (
                            <li key={t} className="relative flex items-center justify-between text-sm">
                                <span
                                    className="absolute -left-6 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border"
                                    style={{
                                        background: s === "done" ? "var(--n-lime)" : "#050507",
                                        borderColor: s === "locked" ? "var(--n-line)" : "var(--n-lime)",
                                        boxShadow: s === "doing" ? "0 0 14px var(--n-lime)" : "none",
                                    }}
                                />
                                <span className={s === "locked" ? "text-[var(--n-muted)]" : "text-[var(--n-text)]"}>
                                    <span className="mr-2 font-code text-[11px] text-[var(--n-muted)]">{String(k + 1).padStart(2, "0")}</span>
                                    {t}
                                </span>
                                {s === "doing" && <span className="font-code text-[10px] uppercase tracking-wider text-[var(--n-lime)]">now</span>}
                            </li>
                        ))}
                    </ol>
                </Tile>

                <Tile i={2} className="lg:col-span-2">
                    <Label>Consistency</Label>
                    <Title>Your streak, visualised.</Title>
                    <div className="mt-6 grid grid-flow-col grid-rows-7 gap-[3px]">
                        {Array.from({ length: 7 * 18 }, (_, k) => {
                            const r = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
                            const lvl = r < 0.35 - (k / 126) * 0.25 ? 0 : Math.min(4, Math.floor(r * 3 + (k / 126) * 2));
                            const col = ["#15151d", "#2b3a12", "#4f6e14", "#8fc21f", "#c6ff3d"][lvl];
                            return (
                                <motion.span
                                    key={k}
                                    className="aspect-square rounded-[3px]"
                                    initial={{ backgroundColor: "#15151d" }}
                                    whileInView={{ backgroundColor: col }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + Math.floor(k / 7) * 0.04, duration: 0.4 }}
                                />
                            );
                        })}
                    </div>
                </Tile>

                <Tile i={3} className="lg:col-span-2">
                    <Label>Bring your own key</Label>
                    <Title>Your Gemini key. Your AI.</Title>
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--n-line)] bg-black/40 px-4 py-3 font-code text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--n-lime)]" aria-hidden>
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="truncate text-[var(--n-muted)]">AIza••••••••••••••••</span>
                        <span className="ml-auto shrink-0 text-[var(--n-lime)]">✓ valid</span>
                    </div>
                    <p className="mt-4 text-sm text-[var(--n-muted)]">Paste a key from Google AI Studio and unlock personalised debugging help.</p>
                </Tile>

                <Tile i={4} className="lg:col-span-2">
                    <Label>Auto-save</Label>
                    <Title>Never lose a line.</Title>
                    <div className="mt-6 rounded-2xl border border-[var(--n-line)] bg-black/40 p-4 font-code text-[13px]">
                        <div className="flex items-center justify-between text-[var(--n-muted)]">
                            <span>solution.py</span>
                            <span className="flex items-center gap-2 text-[var(--n-lime)]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--n-lime)]" /> saved
                            </span>
                        </div>
                        <div className="mt-3 whitespace-pre text-[#b8b8c6]">
                            <span className="text-[#c792ea]">def</span> solve(nums):{"\n"}    seen = set()<span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-[var(--n-lime)]" />
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-[var(--n-muted)]">Drafts persist to your account. Close the tab, come back, keep going.</p>
                </Tile>
            </div>
        </section>
    );
}
