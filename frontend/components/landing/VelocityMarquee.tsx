"use client";

import { useRef } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
    wrap,
} from "motion/react";

const ROW_A = ["IndexError", "TypeError", "KeyError", "off-by-one", "RecursionError"];
const ROW_B = ["WRONG_ANSWER", "NoneType", "infinite loop", "ZeroDivisionError", "TLE"];

function Row({ words, base }: { words: string[]; base: number }) {
    const x = useMotionValue(0);
    const reduced = useReducedMotion();
    const { scrollY } = useScroll();
    const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
    const boost = useTransform(vel, [-2000, 0, 2000], [-6, 0, 6], { clamp: false });
    const skew = useTransform(vel, [-2500, 2500], [12, -12]);
    const dir = useRef(1);

    useAnimationFrame((_, delta) => {
        if (reduced) return;
        const b = boost.get();
        if (b < 0) dir.current = -1;
        else if (b > 0) dir.current = 1;
        const move = dir.current * base * (delta / 1000) * (1 + Math.abs(b));
        x.set(wrap(-25, 0, x.get() + move));
    });
    const tx = useTransform(x, (v) => `${v}%`);

    return (
        <div className="flex overflow-hidden whitespace-nowrap">
            <motion.div className="flex shrink-0" style={{ x: tx, skewX: reduced ? 0 : skew }}>
                {[0, 1, 2, 3].map((k) => (
                    <span key={k} className="flex shrink-0" aria-hidden={k > 0}>
                        {words.map((w, i) => (
                            <span
                                key={w}
                                className={`px-[0.25em] font-display text-[clamp(56px,11vw,180px)] font-black uppercase leading-[1.05] tracking-[-0.04em] ${
                                    i % 2 ? "text-[var(--n-lime)]" : "text-outline"
                                }`}
                            >
                                {w}
                                <span className="text-[var(--n-violet)]">*</span>
                            </span>
                        ))}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/** Two rows of giant error names; speed, direction and skew follow scroll velocity. */
export default function VelocityMarquee() {
    return (
        <section aria-label="Every bug you have ever hit" className="relative overflow-hidden border-y border-[var(--n-line)] py-10">
            <Row words={ROW_A} base={-2} />
            <Row words={ROW_B} base={2} />
        </section>
    );
}
