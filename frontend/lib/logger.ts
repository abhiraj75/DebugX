/**
 * Centralized logging utility for the DebugX frontend.
 *
 * Usage in any module:
 *     import { getLogger } from "@/lib/logger";
 *     const logger = getLogger("Dashboard");
 *     logger.info("Page loaded");
 *
 * Log levels: DEBUG < INFO < WARN < ERROR
 * In production, only WARN and ERROR are shown.
 * In development, all levels are shown.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const isProduction = process.env.NODE_ENV === "production";
const MIN_LEVEL: LogLevel = isProduction ? "WARN" : "DEBUG";

// ─── Formatter ──────────────────────────────────────────────────────────────

function formatTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LEVEL];
}

// ─── Logger Factory ─────────────────────────────────────────────────────────

/**
 * Get a named logger for a component or module.
 *
 * @param name - A short label for the source (e.g., "Auth", "Dashboard", "API")
 * @returns A logger with debug, info, warn, error methods
 *
 * @example
 * const logger = getLogger("Auth");
 * logger.info("User logged in", { uid: user.uid });
 * logger.error("Login failed", error);
 */
export function getLogger(name: string): Logger {
    const paddedName = name.padEnd(14);

    const log = (level: LogLevel, message: string, args: unknown[]) => {
        if (!shouldLog(level)) return;

        const prefix = `${formatTimestamp()} | ${level.padEnd(5)} | ${paddedName} |`;

        switch (level) {
            case "DEBUG":
                console.debug(prefix, message, ...args);
                break;
            case "INFO":
                console.info(prefix, message, ...args);
                break;
            case "WARN":
                console.warn(prefix, message, ...args);
                break;
            case "ERROR":
                console.error(prefix, message, ...args);
                break;
        }
    };

    return {
        debug: (message, ...args) => log("DEBUG", message, args),
        info: (message, ...args) => log("INFO", message, args),
        warn: (message, ...args) => log("WARN", message, args),
        error: (message, ...args) => log("ERROR", message, args),
    };
}
