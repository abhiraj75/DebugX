"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Check, X, Loader2, Sparkles, Key } from "lucide-react";
import { validateApiKey, saveApiKey } from "@/lib/api";
import { getLogger } from "@/lib/logger";

const logger = getLogger("ApiKeyModal");

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<"idle" | "validating" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleSave = async () => {
        const key = apiKey.trim();
        if (!key) {
            setErrorMsg("Please paste your API key");
            setStatus("error");
            return;
        }

        try {
            // Step 1: Validate the key
            setStatus("validating");
            setErrorMsg("");
            logger.info("Validating API key");

            const { valid } = await validateApiKey(key);
            if (!valid) {
                setStatus("error");
                setErrorMsg("Invalid API key — make sure you copied the full key starting with AIza...");
                logger.warn("API key validation failed");
                return;
            }

            // Step 2: Save the key
            setStatus("saving");
            logger.info("API key valid, saving");
            await saveApiKey(key);

            setStatus("success");
            logger.info("API key saved successfully");

            // Close after a brief success animation
            setTimeout(() => {
                onSaved();
                onClose();
            }, 1200);
        } catch (err: any) {
            logger.error("API key save failed", { error: err.message });
            setStatus("error");
            setErrorMsg(err.message || "Something went wrong. Please try again.");
        }
    };

    const handleSkip = () => {
        // Remember dismissal in localStorage (re-prompt after 7 days)
        localStorage.setItem("apikey_modal_dismissed", Date.now().toString());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white dark:text-neutral-900" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                Set Up AI Hints
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Get personalized debugging help powered by Gemini
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guide Section */}
                <div className="px-6 pb-4">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" />
                            How to get your free API key
                        </p>

                        <ol className="space-y-2">
                            {[
                                "Go to Google AI Studio (link below)",
                                "Sign in with your Google account",
                                <>Click <span className="font-semibold text-neutral-900 dark:text-white">&quot;Create API Key&quot;</span></>,
                                "Select any project (or create a new one)",
                                <>Copy the key (starts with <code className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded font-mono">AIza...</code>)</>,
                                "Paste it below",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300 mt-0">
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>

                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white hover:underline"
                        >
                            Open Google AI Studio
                            <ExternalLink className="w-3 h-3" />
                        </a>

                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
                            It&apos;s completely free — Google gives you a generous free tier.
                        </p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="px-6 pb-6">
                    {status === "success" ? (
                        <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                                <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                API key saved successfully!
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                                AI hints are now enabled for your account.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Error message */}
                            {status === "error" && errorMsg && (
                                <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                                </div>
                            )}

                            {/* Key input */}
                            <div className="relative mb-4">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    Your Gemini API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        placeholder="AIza..."
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            if (status === "error") setStatus("idle");
                                        }}
                                        disabled={status === "validating" || status === "saving"}
                                        className="w-full border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 rounded-lg px-3 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 placeholder-neutral-300 dark:placeholder-neutral-600 transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleSkip}
                                    className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!apiKey.trim() || status === "validating" || status === "saving"}
                                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium py-2.5 px-5 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {status === "validating" && (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Validating...
                                        </>
                                    )}
                                    {status === "saving" && (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    )}
                                    {(status === "idle" || status === "error") && "Validate & Save"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
