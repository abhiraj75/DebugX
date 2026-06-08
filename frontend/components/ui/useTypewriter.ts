"use client";

import { useEffect, useState } from "react";

interface Options {
    text: string;
    speed?: number;        // ms per character
    startDelay?: number;   // ms before typing begins
    inView?: boolean;      // gate by viewport
    enabled?: boolean;     // master switch
}

/**
 * Drops characters into `displayText` one at a time.
 *
 * Implementation note: we do NOT use a "started" flag — that pattern interacts
 * badly with React 18 Strict Mode (the second mount's cleanup kills the timer
 * scheduled by the first mount, and the early-return prevents a restart).
 * Instead, the effect is fully idempotent: cleanup clears its own timers, and
 * on real dep change we reset displayText and start over.
 */
export function useTypewriter({
    text,
    speed = 40,
    startDelay = 0,
    inView = true,
    enabled = true,
}: Options) {
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (!enabled || !inView) return;

        // Reset for this run (covers Strict Mode re-mount and real dep changes)
        setDisplayText("");
        setIsDone(false);

        const reduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduced) {
            setDisplayText(text);
            setIsDone(true);
            return;
        }

        let intervalId: ReturnType<typeof setInterval> | undefined;
        const timeoutId = setTimeout(() => {
            let i = 0;
            intervalId = setInterval(() => {
                i += 1;
                setDisplayText(text.slice(0, i));
                if (i >= text.length) {
                    if (intervalId) clearInterval(intervalId);
                    setIsDone(true);
                }
            }, speed);
        }, startDelay);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [text, speed, startDelay, inView, enabled]);

    return { displayText, isDone };
}

/**
 * Tracks the index of the currently-typing line in a list. When the line
 * at index `i` finishes, advances to `i + 1`. Each line types itself.
 */
export function useSequentialTypewriter(lineCount: number, inView: boolean) {
    const [activeIdx, setActiveIdx] = useState(0);

    const advance = () => {
        setActiveIdx((i) => Math.min(i + 1, lineCount));
    };

    useEffect(() => {
        if (!inView) return;
        setActiveIdx((idx) => (idx === 0 ? 0 : idx));
    }, [inView]);

    return { activeIdx, advance };
}
