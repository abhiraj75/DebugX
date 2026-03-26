"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { fetchProblems, ProblemListItem } from "@/lib/api";

const DIFF_COLORS: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
};

const FILTERS = ["all", "easy", "medium", "hard"];

export default function ProblemsPage() {
    const [problems, setProblems] = useState<ProblemListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");
    const router = useRouter();

    useEffect(() => {
        loadProblems();
    }, [filter]);

    const loadProblems = async () => {
        try {
            setLoading(true);
            setError(null);
            const filters = filter !== "all" ? { difficulty: filter } : undefined;
            const data = await fetchProblems(filters);
            setProblems(data);
        } catch (err: any) {
            setError(err.message || "Failed to load problems");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
                {/* Nav */}
                <nav className="border-b border-neutral-200 dark:border-neutral-800 h-12 flex items-center px-6 sticky top-0 bg-white dark:bg-neutral-950 z-10">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm font-semibold text-neutral-900 dark:text-white tracking-wide"
                    >
                        CODEXA
                    </button>
                </nav>

                <main className="max-w-4xl mx-auto px-6 py-10">
                    <h1 className="text-xl font-semibold mb-6">Problems</h1>

                    {/* Filters */}
                    <div className="flex gap-1 mb-6">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs rounded capitalize transition ${
                                    filter === f
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    {loading ? (
                        <p className="text-neutral-600 text-sm">Loading...</p>
                    ) : problems.length === 0 ? (
                        <p className="text-neutral-600 text-sm">No problems found.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-neutral-500 text-xs uppercase border-b border-neutral-800">
                                    <th className="text-left py-2 font-medium">#</th>
                                    <th className="text-left py-2 font-medium">Title</th>
                                    <th className="text-left py-2 font-medium">Difficulty</th>
                                    <th className="text-left py-2 font-medium">Topic</th>
                                    <th className="text-right py-2 font-medium">Acceptance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => router.push(`/problems/${p.slug}`)}
                                        className="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition"
                                    >
                                        <td className="py-3 text-neutral-500">{i + 1}</td>
                                        <td className="py-3 text-neutral-900 dark:text-white">{p.title}</td>
                                        <td className={`py-3 capitalize ${DIFF_COLORS[p.difficulty] || ""}`}>
                                            {p.difficulty}
                                        </td>
                                        <td className="py-3 text-neutral-400">{p.topic}</td>
                                        <td className="py-3 text-right text-neutral-400">{p.success_rate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
