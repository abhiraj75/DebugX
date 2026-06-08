"use client";

import Link from "next/link";
import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface Props {
    href: string;
    children: ReactNode;
    className?: string;
    radius?: number;
    strength?: number;
}

/**
 * Anchor wrapped in a magnetic field — translates toward the cursor when
 * within `radius` px, snaps back on leave. Uses spring physics.
 */
export default function MagneticLink({
    href,
    children,
    className = "",
    radius = 90,
    strength = 0.35,
}: Props) {
    const ref = useRef<HTMLAnchorElement | null>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
    const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

    const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const el = ref.current;
        if (!el) return;
        if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius + Math.max(rect.width, rect.height) / 2) {
            x.set(dx * strength);
            y.set(dy * strength);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ x: sx, y: sy }}
            className={`inline-block will-change-transform ${className}`}
        >
            {children}
        </motion.a>
    );
}

export function MagneticNextLink({
    href,
    children,
    className = "",
    radius = 90,
    strength = 0.35,
}: Props) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
    const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

    const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
        const el = ref.current;
        if (!el) return;
        if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius + Math.max(rect.width, rect.height) / 2) {
            x.set(dx * strength);
            y.set(dy * strength);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.span
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ x: sx, y: sy }}
            className="inline-block will-change-transform"
        >
            <Link href={href} className={className}>
                {children}
            </Link>
        </motion.span>
    );
}
