"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// import { SmoothScroll } from "@/components/ui/SmoothScroll";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import AIFeedbackSection from "@/components/landing/AIFeedbackSection";
import VisualizerSection from "@/components/landing/VisualizerSection";
import StatsSection from "@/components/landing/StatsSection";
import LearningSection from "@/components/landing/LearningSection";
import CTASection from "@/components/landing/CTASection";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--term-bg)] font-term">
                <div className="text-center">
                    <div className="text-[var(--term-green)] text-sm tracking-[0.2em] uppercase">
                        debugx<span className="cursor-blink ml-1">_</span>
                    </div>
                    <p className="mt-3 text-[12px] text-[var(--term-muted)]">booting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="terminal-root font-term min-h-screen bg-[var(--term-bg)] text-[var(--term-white)]">
            <Navbar />
            <main>
                <HeroSection />
                <ProblemSection />
                <AIFeedbackSection />
                <VisualizerSection />
                <StatsSection />
                <LearningSection />
                <CTASection />
            </main>
        </div>
    );
}
