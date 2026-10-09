"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/** Dot + lagging ring. Grows over links; shows the element's data-cursor label. */
export default function Cursor() {
    const [enabled, setEnabled] = useState(false);
    const [hover, setHover] = useState(false);
    const [label, setLabel] = useState("");
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
    const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });

    useEffect(() => {
        const ok =
            window.matchMedia("(pointer: fine)").matches &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!ok) return;
        setEnabled(true);
        const root = document.querySelector(".neural-root");
        root?.classList.add("has-cursor");

        const move = (e: PointerEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
            const el = (e.target as Element).closest?.("a, button, [data-cursor]");
            setHover(!!el);
            setLabel(el?.getAttribute("data-cursor") ?? "");
        };
        window.addEventListener("pointermove", move);
        return () => {
            window.removeEventListener("pointermove", move);
            root?.classList.remove("has-cursor");
        };
    }, [x, y]);

    if (!enabled) return null;
    const size = label ? 84 : hover ? 56 : 32;

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
            <motion.div
                className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--n-lime)]"
                style={{ x, y }}
            />
            <motion.div
                className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-[var(--n-lime)] font-code text-[10px] uppercase tracking-[0.15em] text-[#050507] mix-blend-difference"
                style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
                animate={{
                    width: size,
                    height: size,
                    backgroundColor: label ? "rgba(198,255,61,1)" : "rgba(198,255,61,0)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
                {label}
            </motion.div>
        </div>
    );
}
