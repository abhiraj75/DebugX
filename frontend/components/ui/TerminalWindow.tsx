"use client";

import { ReactNode } from "react";

interface Props {
    title?: string;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
    /** Adds a colored left border accent (used for AI feedback panel) */
    accent?: "green" | "purple" | "yellow" | "red" | "blue" | "none";
    /** Compact mode reduces padding for inline cards */
    compact?: boolean;
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
    green: "border-l-2 border-l-[var(--term-green)]",
    purple: "border-l-2 border-l-[var(--term-purple)]",
    yellow: "border-l-2 border-l-[var(--term-yellow)]",
    red: "border-l-2 border-l-[var(--term-red)]",
    blue: "border-l-2 border-l-[var(--term-blue)]",
    none: "",
};

/**
 * macOS-style terminal shell with traffic-light dots and a centered title.
 * - Sharp corners (radius 4px max)
 * - 1px subtle border
 * - Dark surface with optional left-edge accent
 */
export default function TerminalWindow({
    title = "debugx — zsh",
    children,
    className = "",
    bodyClassName = "",
    accent = "none",
    compact = false,
}: Props) {
    return (
        <div
            className={`relative bg-[var(--term-bg-card)] border border-[var(--term-border)] rounded-[4px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${accentMap[accent]} ${className}`}
        >
            {/* Title bar */}
            <div className="relative flex items-center h-9 px-3.5 bg-[var(--term-bg-secondary)] border-b border-[var(--term-border)] select-none">
                <div className="flex items-center gap-2">
                    <span className="block h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="block h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="block h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="absolute inset-x-0 text-center text-[11px] text-[var(--term-muted)] tracking-wide pointer-events-none">
                    {title}
                </div>
            </div>

            {/* Content */}
            <div
                className={`${compact ? "p-4" : "p-6"} text-[var(--term-white)] ${bodyClassName}`}
            >
                {children}
            </div>
        </div>
    );
}

/* ---------- Re-usable text atoms ---------- */

export function TermLine({
    children,
    color = "white",
    className = "",
}: {
    children: ReactNode;
    color?: "white" | "green" | "muted" | "red" | "yellow" | "blue" | "purple";
    className?: string;
}) {
    const colors = {
        white: "text-[var(--term-white)]",
        green: "text-[var(--term-green)]",
        muted: "text-[var(--term-muted)]",
        red: "text-[var(--term-red)]",
        yellow: "text-[var(--term-yellow)]",
        blue: "text-[var(--term-blue)]",
        purple: "text-[var(--term-purple)]",
    } as const;
    return <div className={`${colors[color]} ${className}`}>{children}</div>;
}

export function CursorBlink({ className = "" }: { className?: string }) {
    return <span className={`cursor-blink ${className}`}>█</span>;
}

export function TermPrompt({ path = "~/dev" }: { path?: string }) {
    return (
        <span className="text-[var(--term-muted)]">
            <span>{path}</span> <span className="text-[var(--term-green)]">$</span>{" "}
        </span>
    );
}
