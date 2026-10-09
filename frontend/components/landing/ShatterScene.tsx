"use client";

import { useEffect, useRef, useState } from "react";
import { motion, transform, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

// Function mappers (not range arrays) keep Motion from offloading to a native ScrollTimeline,
// which disagreed with this section's offsets and left captions stuck.
const map = (input: number[], output: number[]) => transform(input, output);

const BROKEN = ["def find_max(arr):", "    return arr[0]", "", "find_max([])  # IndexError"];
const FIXED = ["def find_max(arr):", "    if not arr:", "        return None", "    return max(arr)"];

const CAPTIONS = [
    { text: "You submit.", range: [0, 0, 0.12, 0.15], color: "var(--n-text)" },
    { text: "WRONG_ANSWER.", range: [0.13, 0.16, 0.27, 0.3], color: "var(--n-red)" },
    { text: "DebugX reads it.", range: [0.28, 0.32, 0.55, 0.6], color: "var(--n-violet)" },
    { text: "Fixed. And now you know why.", range: [0.6, 0.66, 1, 1], color: "var(--n-lime)" },
];

const STATUS = [
    { at: 0, text: "● running tests…", color: "var(--n-muted)" },
    { at: 0.15, text: "✗ IndexError · line 2", color: "var(--n-red)" },
    { at: 0.5, text: "◆ ai analyzing…", color: "var(--n-violet)" },
    { at: 0.78, text: "✓ 10/10 tests passed", color: "var(--n-lime)" },
];

type P = { ax: number; ay: number; bx: number; by: number; dx: number; dy: number; r: number; spin: number };

/** Rasterise code lines and return the lit pixels as points. */
function sample(lines: string[], font: string, size: number, w: number, h: number, step: number) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.font = `500 ${size}px ${font}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";
    const lh = size * 1.6;
    const blockW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const x0 = (w - blockW) / 2;
    const y0 = (h - lines.length * lh) / 2 + h * 0.04;
    lines.forEach((l, i) => ctx.fillText(l, x0, y0 + i * lh));
    const data = ctx.getImageData(0, 0, w, h).data;
    const pts: [number, number][] = [];
    for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 140) pts.push([x, y]);
    return pts;
}

const shuffle = <T,>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement>, progress: MotionValue<number>, enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let parts: P[] = [];
        let w = 0;
        let h = 0;
        let cancelled = false;

        const build = async () => {
            await document.fonts.ready;
            if (cancelled) return;
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            const font = getComputedStyle(document.body).getPropertyValue("--font-jb-mono") || "monospace";
            const size = Math.min(40, (w - 40) / 16);
            const step = 2;
            // ponytail: fillRect per particle; cap is the perf knob for slow devices
            const cap = w < 768 ? 2500 : 6000;
            const A = shuffle(sample(BROKEN, font, size, w, h, step)).slice(0, cap);
            const B = shuffle(sample(FIXED, font, size, w, h, step)).slice(0, cap);
            const n = Math.max(A.length, B.length);
            const R = Math.max(w, h) * 0.45;
            parts = Array.from({ length: n }, (_, i) => {
                const a = A[i] ?? A[(Math.random() * A.length) | 0];
                const b = B[i] ?? B[(Math.random() * B.length) | 0];
                const ang = Math.random() * Math.PI * 2;
                return {
                    ax: a[0], ay: a[1], bx: b[0], by: b[1],
                    dx: Math.cos(ang), dy: Math.sin(ang),
                    r: R * (0.25 + Math.random() * 0.75),
                    spin: (Math.random() - 0.5) * 2.4,
                };
            });
        };
        build();
        window.addEventListener("resize", build);

        // swirl position at explode progress e (0..1) plus extra rotation
        const swirl = (p: P, e: number, rot: number) => {
            const cx = w / 2;
            const cy = h / 2;
            const x = p.ax - cx + p.dx * p.r * e;
            const y = p.ay - cy + p.dy * p.r * e * 0.7;
            const a = p.spin * e + rot;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            return [cx + x * cos - y * sin, cy + x * sin + y * cos];
        };

        let cur = progress.get();
        let visible = false;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(canvas);

        let raf = 0;
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            if (!visible || !parts.length) return;
            cur += (progress.get() - cur) * 0.1;
            const p = cur;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            const s = 1.6;

            const draw = (color: string, ox: number, oy: number, pos: (q: P) => number[]) => {
                ctx.fillStyle = color;
                for (const q of parts) {
                    const [x, y] = pos(q);
                    ctx.fillRect(x + ox, y + oy, s, s);
                }
            };

            if (p < 0.15) {
                draw("#f2f2f5", 0, 0, (q) => [q.ax, q.ay]);
            } else if (p < 0.25) {
                // error: jitter + RGB split
                const k = Math.sin(((p - 0.15) / 0.1) * Math.PI);
                const off = 2 + k * 8;
                const jit = (q: P) => [q.ax + (Math.random() - 0.5) * k * 4, q.ay];
                ctx.globalCompositeOperation = "lighter";
                draw("rgba(255,61,90,0.9)", -off, 0, jit);
                draw("rgba(0,229,255,0.6)", off, 0, jit);
                ctx.globalCompositeOperation = "source-over";
            } else if (p < 0.5) {
                const e = easeInOut((p - 0.25) / 0.25);
                const t = now / 1000;
                draw(e < 0.5 ? "#ff3d5a" : "#8b5cf6", 0, 0, (q) => swirl(q, e, t * 0.15 * e));
            } else {
                const k = easeInOut(clamp01((p - 0.5) / 0.28));
                const t = now / 1000;
                draw(k < 0.6 ? "#8b5cf6" : "#c6ff3d", 0, 0, (q) => {
                    const [sx, sy] = swirl(q, 1, t * 0.15 * (1 - k));
                    return [sx + (q.bx - sx) * k, sy + (q.by - sy) * k];
                });
            }
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener("resize", build);
        };
    }, [canvasRef, progress, enabled]);
}

function Caption({ c, progress }: { c: (typeof CAPTIONS)[number]; progress: MotionValue<number> }) {
    const [a, b, d, e] = c.range;
    // first caption starts shown, last one stays shown: drop the zero-length edge so input stays strictly increasing
    const input = a === b ? [b, d, e] : e === d ? [a, b, d] : [a, b, d, e];
    const vis = a === b ? [1, 1, 0] : e === d ? [0, 1, 1] : [0, 1, 1, 0];
    const opacity = useTransform(progress, map(input, vis));
    const y = useTransform(progress, map(input, vis.map((v, k) => (v ? 0 : k === 0 ? 40 : -40))));
    const filter = useTransform(opacity, (v) => `blur(${(1 - v) * 10}px)`);
    return (
        <motion.p
            className="absolute inset-x-0 text-center font-display font-black uppercase leading-[0.95] tracking-[-0.03em] text-[clamp(30px,6vw,88px)]"
            style={{ opacity, y, filter, color: c.color }}
        >
            {c.text}
        </motion.p>
    );
}

export default function ShatterScene() {
    const ref = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const [status, setStatus] = useState(STATUS[0]);
    useParticles(canvasRef, scrollYProgress, reduced === false);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const s = [...STATUS].reverse().find((x) => v >= x.at)!;
        if (s !== status) setStatus(s);
    });
    const flash = useTransform(scrollYProgress, map([0.15, 0.17, 0.24], [0, 0.22, 0]));
    const aiOpacity = useTransform(scrollYProgress, map([0.78, 0.84], [0, 1]));
    const aiY = useTransform(scrollYProgress, map([0.78, 0.84], [20, 0]));

    if (reduced) {
        return (
            <section id="shatter" ref={ref} className="mx-auto max-w-4xl px-4 py-32 sm:px-8">
                <div className="space-y-3 font-display text-3xl font-black uppercase sm:text-5xl">
                    {CAPTIONS.map((c) => (
                        <p key={c.text} style={{ color: c.color }}>{c.text}</p>
                    ))}
                </div>
                <pre className="mt-12 overflow-x-auto rounded-2xl border border-[var(--n-line)] bg-[var(--n-surface)] p-6 font-code text-sm text-[var(--n-lime)]">
                    {FIXED.join("\n")}
                </pre>
            </section>
        );
    }

    return (
        <section id="shatter" ref={ref} className="relative h-[420vh]">
            <div className="sticky top-0 h-[100svh] overflow-hidden">
                <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--n-red)]" style={{ opacity: flash }} />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--n-line) 1px, transparent 1px), linear-gradient(90deg, var(--n-line) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 75%)",
                    }}
                />
                <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

                <div className="pointer-events-none absolute inset-x-4 top-[13%] h-[22%] sm:inset-x-8">
                    {CAPTIONS.map((c) => (
                        <Caption key={c.text} c={c} progress={scrollYProgress} />
                    ))}
                </div>
                <p className="sr-only">
                    A failing find_max function crashes with IndexError on an empty list. DebugX explains the bug and the code is
                    rebuilt with an empty-list guard.
                </p>

                <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4 px-4">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2 font-code text-xs backdrop-blur-md">
                        <span className="text-[var(--n-muted)]">find_max.py</span>
                        <span className="h-3 w-px bg-white/15" />
                        <span style={{ color: status.color }}>{status.text}</span>
                    </div>
                    <motion.div
                        style={{ opacity: aiOpacity, y: aiY }}
                        className="max-w-md rounded-2xl border border-[var(--n-violet)]/40 bg-[#0d0a18]/80 px-5 py-4 text-center font-code text-xs leading-relaxed text-[#cfc7ff] backdrop-blur-md"
                    >
                        <span className="text-[var(--n-violet)]">[AI]</span> line 2 assumed the list is never empty. Guard the
                        empty case first, and use max() to actually find the max.
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
