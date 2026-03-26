"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
    const { user, dbUser, signOut } = useAuth();
    const router = useRouter();
    const [activity, setActivity] = useState<Record<string, number>>({});

    const displayName = dbUser?.display_name || user?.displayName || "User";
    const email = dbUser?.email || user?.email || "";

    // Fetch activity data
    useEffect(() => {
        if (user?.uid) {
            fetch(`${API_URL}/api/users/activity/${user.uid}`)
                .then((r) => r.json())
                .then((d) => setActivity(d.activity || {}))
                .catch(() => {});
        }
    }, [user?.uid]);

    const handleSignOut = async () => {
        await signOut();
        router.replace("/login");
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
                {/* Nav */}
                <nav className="border-b border-neutral-200 dark:border-neutral-800 h-12 flex items-center justify-between px-6 sticky top-0 bg-white dark:bg-neutral-950 z-10">
                    <span className="text-sm font-semibold tracking-wide">CODEXA</span>
                    <button
                        onClick={handleSignOut}
                        className="text-neutral-500 hover:text-white text-xs transition"
                    >
                        Sign Out
                    </button>
                </nav>

                <main className="max-w-3xl mx-auto px-6 py-10">
                    {/* User info */}
                    <div className="mb-8">
                        <h1 className="text-xl font-semibold">{displayName}</h1>
                        <p className="text-neutral-500 text-sm">{email}</p>
                        {dbUser?.username && (
                            <p className="text-neutral-600 text-xs mt-1">@{dbUser.username}</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="border border-neutral-800 rounded p-4">
                            <p className="text-2xl font-semibold">{dbUser?.problems_solved ?? 0}</p>
                            <p className="text-neutral-500 text-xs mt-1">Solved</p>
                        </div>
                        <div className="border border-neutral-800 rounded p-4">
                            <p className="text-2xl font-semibold">{dbUser?.total_score ?? 0}</p>
                            <p className="text-neutral-500 text-xs mt-1">Score</p>
                        </div>
                        <div className="border border-neutral-800 rounded p-4">
                            <p className="text-2xl font-semibold">{dbUser?.current_streak ?? 0}</p>
                            <p className="text-neutral-500 text-xs mt-1">Streak</p>
                        </div>
                    </div>

                    {/* Contribution graph */}
                    <div className="border border-neutral-800 rounded p-4 mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-neutral-400">Activity</p>
                            <p className="text-xs text-neutral-600">
                                {Object.values(activity).reduce((a, b) => a + b, 0)} submissions this year
                            </p>
                        </div>
                        <ContributionGraph activity={activity} />
                    </div>

                    {/* Quick link */}
                    <button
                        onClick={() => router.push("/problems")}
                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                    >
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Practice Problems</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Solve problems and get AI hints</p>
                    </button>
                </main>
            </div>
        </ProtectedRoute>
    );
}


// ─── GitHub-style Contribution Graph ─────────────────────────────────────────

function ContributionGraph({ activity }: { activity: Record<string, number> }) {
    const { weeks, months } = useMemo(() => buildGraph(activity), [activity]);

    return (
        <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex mb-1 ml-0">
                {months.map((m, i) => (
                    <span
                        key={i}
                        className="text-[10px] text-neutral-600"
                        style={{ width: `${m.span * 13}px` }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className={`w-[10px] h-[10px] rounded-sm ${
                                    day === null
                                        ? "bg-transparent"
                                        : day === 0
                                        ? "bg-neutral-900"
                                        : day <= 2
                                        ? "bg-green-900"
                                        : day <= 5
                                        ? "bg-green-700"
                                        : "bg-green-500"
                                }`}
                                title={day !== null ? `${day} submissions` : ""}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 mt-2 justify-end">
                <span className="text-[10px] text-neutral-600 mr-1">Less</span>
                <div className="w-[10px] h-[10px] rounded-sm bg-neutral-900" />
                <div className="w-[10px] h-[10px] rounded-sm bg-green-900" />
                <div className="w-[10px] h-[10px] rounded-sm bg-green-700" />
                <div className="w-[10px] h-[10px] rounded-sm bg-green-500" />
                <span className="text-[10px] text-neutral-600 ml-1">More</span>
            </div>
        </div>
    );
}


function buildGraph(activity: Record<string, number>) {
    const today = new Date();
    const weeks: (number | null)[][] = [];
    const months: { label: string; span: number }[] = [];

    // Go back ~52 weeks from today
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;
    let currentMonthSpan = 0;

    const cursor = new Date(start);
    while (cursor <= today) {
        const week: (number | null)[] = [];
        for (let d = 0; d < 7; d++) {
            if (cursor > today) {
                week.push(null);
            } else if (cursor < new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)) {
                week.push(null);
            } else {
                const key = cursor.toISOString().split("T")[0];
                week.push(activity[key] || 0);
            }

            // Track months
            const m = cursor.getMonth();
            if (m !== lastMonth) {
                if (currentMonthSpan > 0) {
                    months[months.length - 1].span = currentMonthSpan;
                }
                months.push({ label: monthNames[m], span: 0 });
                lastMonth = m;
                currentMonthSpan = 0;
            }

            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
        currentMonthSpan++;
    }

    // Set last month span
    if (months.length > 0) {
        months[months.length - 1].span = currentMonthSpan;
    }

    return { weeks, months };
}
