"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import Preloader from "@/components/landing/Preloader";
import Cursor from "@/components/landing/Cursor";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ShatterScene from "@/components/landing/ShatterScene";
import VelocityMarquee from "@/components/landing/VelocityMarquee";
import VisualizerScene from "@/components/landing/VisualizerScene";
import Bento from "@/components/landing/Bento";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="neural-root min-h-screen" />;
    }

    return (
        <SmoothScroll>
            <div className="neural-root min-h-screen overflow-x-clip">
                <Preloader onDone={() => setReady(true)} />
                <Cursor />
                <div aria-hidden className="grain" />
                <Navbar />
                <main>
                    <HeroSection ready={ready} />
                    <ShatterScene />
                    <VelocityMarquee />
                    <VisualizerScene />
                    <Bento />
                    <FinalCTA />
                </main>
            </div>
        </SmoothScroll>
    );
}
