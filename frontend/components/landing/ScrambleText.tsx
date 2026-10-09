"use client";

import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@01";

/** Text that decodes from random glyphs, left to right, once `play` is true. */
export default function ScrambleText({
    text,
    play,
    delay = 0,
    duration = 900,
    className = "",
}: {
    text: string;
    play: boolean;
    delay?: number;
    duration?: number;
    className?: string;
}) {
    const [out, setOut] = useState(text.replace(/\S/g, " "));

    useEffect(() => {
        if (!play) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOut(text);
        let raf = 0;
        const start = performance.now() + delay;
        const tick = (now: number) => {
            const p = (now - start) / duration;
            if (p < 0) {
                raf = requestAnimationFrame(tick);
                return;
            }
            const resolved = Math.floor(p * text.length);
            setOut(
                [...text]
                    .map((c, i) => {
                        if (c === " " || i < resolved) return c;
                        if (i > resolved + 6) return " ";
                        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
                    })
                    .join("")
            );
            if (p < 1) raf = requestAnimationFrame(tick);
            else setOut(text);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [play, text, delay, duration]);

    return (
        <span aria-label={text} className={className}>
            <span aria-hidden className="whitespace-pre">{out}</span>
        </span>
    );
}
