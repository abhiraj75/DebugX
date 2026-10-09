"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const KEY = "debugx-preloaded";
const EASE = [0.76, 0, 0.24, 1] as const;

/** 000→100 boot counter, then the screen splits open. Once per session. */
export default function Preloader({ onDone }: { onDone: () => void }) {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(true);
    const [skip, setSkip] = useState(false);

    useEffect(() => {
        let seen = false;
        try {
            seen = sessionStorage.getItem(KEY) === "1";
        } catch {}
        if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setSkip(true);
            onDone();
            return;
        }
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / 1100);
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
            if (p < 1) raf = requestAnimationFrame(tick);
            else {
                try {
                    sessionStorage.setItem(KEY, "1");
                } catch {}
                setTimeout(() => setShow(false), 150);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (skip) return null;
    return (
        <AnimatePresence onExitComplete={onDone}>
            {show && (
                <motion.div key="pre" className="fixed inset-0 z-[110] pointer-events-none" exit={{ transition: { duration: 0.9 } }}>
                    <motion.div
                        className="absolute inset-x-0 top-0 h-1/2 bg-[#050507]"
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.9, ease: EASE }}
                    />
                    <motion.div
                        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#050507]"
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.9, ease: EASE }}
                    />
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 font-code"
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="font-display text-[clamp(64px,14vw,180px)] font-black leading-none tabular-nums text-[var(--n-lime)]">
                            {String(count).padStart(3, "0")}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--n-muted)]">
                            compiling your next breakthrough
                        </div>
                        <div className="h-px w-48 bg-[var(--n-line)]">
                            <div className="h-px bg-[var(--n-lime)]" style={{ width: `${count}%` }} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
