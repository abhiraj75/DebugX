"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CodeEditor from "@/components/editor/CodeEditor";
import { fetchProblem, submitCode, ProblemDetail, SubmissionResult } from "@/lib/api";
import { Group, Panel, Separator } from "react-resizable-panels";

const DIFF_COLORS: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
};

export default function ProblemSolvePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.id as string;

    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [language, setLanguage] = useState<"python" | "javascript">("python");
    const [code, setCode] = useState("");
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [activeTab, setActiveTab] = useState<"console" | "tests" | "feedback">("console");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProblem(slug);
                setProblem(data);
                if (data.starter_code?.python) {
                    setCode(data.starter_code.python);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load problem");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    const handleSubmit = async () => {
        if (!problem) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await submitCode(problem.id, code, language);
            setResult(res);
            setActiveTab("tests");
        } catch (err: any) {
            setError(err.message || "Submission failed");
            setActiveTab("console");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (problem?.starter_code?.[language]) setCode(problem.starter_code[language]);
        setResult(null);
        setError(null);
        setActiveTab("console");
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="h-screen bg-black flex items-center justify-center text-neutral-500 text-sm font-mono">
                    <div className="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                    Loading...
                </div>
            </ProtectedRoute>
        );
    }

    if (error && !problem) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-5xl font-mono font-bold text-neutral-800 mb-4">404</p>
                        <h2 className="text-xl font-bold text-white mb-2">Problem not found</h2>
                        <p className="text-sm text-neutral-500 mb-4">{error}</p>
                        <button onClick={() => router.push("/problems")} className="text-neutral-400 text-sm hover:text-white underline">
                            Back to Problems
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!problem) return null;

    return (
        <ProtectedRoute>
            <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col overflow-hidden text-neutral-700 dark:text-neutral-300">
                {/* Header Navbar */}
                <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center px-4 py-2 shrink-0">
                    <button onClick={() => router.push("/problems")} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm flex items-center gap-2">
                        ← Back
                    </button>
                    <div className="flex-1 text-center font-medium text-neutral-900 dark:text-white">{problem.title}</div>
                </nav>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Panel — Problem Description */}
                    <div className="w-full lg:w-1/2 overflow-y-auto bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
                        <div className="p-6 md:p-8">
                            {/* Title & Badges */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-white mb-3">{problem.title}</h1>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`capitalize font-semibold ${DIFF_COLORS[problem.difficulty?.toLowerCase()] || "text-neutral-400"}`}>
                                        {problem.difficulty}
                                    </span>
                                    <span className="text-neutral-600">|</span>
                                    <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">{problem.topic}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Description</h2>
                                <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{problem.description}</p>
                            </div>

                            {/* Examples */}
                            {problem.examples && problem.examples.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Examples</h2>
                                    {problem.examples.map((example, index) => (
                                        <div key={index} className="border border-neutral-800 rounded-lg p-4 mb-3 bg-neutral-900 font-mono text-sm shadow-sm">
                                            <p className="text-xs text-neutral-500 mb-2 font-sans tracking-wide">Example {index + 1}</p>
                                            <div className="space-y-2">
                                                <p className="flex flex-col gap-1">
                                                    <span className="text-neutral-500 text-xs">Input:</span>
                                                    <span className="text-neutral-300">{example.input}</span>
                                                </p>
                                                <p className="flex flex-col gap-1">
                                                    <span className="text-neutral-500 text-xs">Output:</span>
                                                    <span className="text-neutral-300">{example.output}</span>
                                                </p>
                                                {example.explanation && (
                                                    <p className="flex flex-col gap-1 pt-2 border-t border-neutral-800 mt-2">
                                                        <span className="text-neutral-500 text-xs text-sans">Explanation:</span>
                                                        <span className="text-neutral-400 font-sans text-xs leading-relaxed">{example.explanation}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Constraints */}
                            {problem.constraints && problem.constraints.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Constraints</h2>
                                    <ul className="space-y-2">
                                        {problem.constraints.map((constraint, index) => (
                                            <li key={index} className="flex items-start gap-3 font-mono text-sm bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-800">
                                                <span className="text-neutral-400 select-none mt-0.5">•</span>
                                                <span className="text-neutral-300">{constraint}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel — Code Editor & Output */}
                    <div className="w-full lg:w-1/2 flex flex-col bg-neutral-950">
                        {/* Editor Toolbar */}
                        <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800">
                            <div className="flex items-center gap-3">
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        const newLang = e.target.value as "python" | "javascript";
                                        setLanguage(newLang);
                                        if (problem.starter_code?.[newLang]) {
                                            setCode(problem.starter_code[newLang]);
                                        }
                                    }}
                                    className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-3 py-1.5 rounded-md font-mono text-xs border border-neutral-200 dark:border-neutral-700 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 cursor-pointer transition-colors"
                                >
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                </select>
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-mono transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold px-5 py-2 rounded shadow-sm hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                            >
                                {submitting ? "Submitting..." : "Submit Code"}
                            </button>
                        </div>

                        <Group orientation="vertical" className="flex-1">
                            <Panel defaultSize={60} minSize={20}>
                                {/* Editor Area */}
                                <div className="h-full overflow-hidden relative">
                                    <CodeEditor
                                        language={language}
                                        value={code}
                                        onChange={(val) => setCode(val || "")}
                                    />
                                </div>
                            </Panel>

                            <Separator className="h-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors cursor-row-resize z-10" />

                            <Panel defaultSize={40} minSize={10}>
                                {/* Output Panel (Bottom split) */}
                                <div className="bg-white dark:bg-neutral-950 flex flex-col h-full border-t border-neutral-200 dark:border-neutral-800">
                            {/* Tabs */}
                            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                {(["console", "tests", "feedback"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${activeTab === tab
                                            ? "text-white border-b-2 border-white"
                                            : "text-neutral-500 hover:text-neutral-300"
                                            }`}
                                    >
                                        {tab === "tests" ? "Test Cases" : tab === "feedback" ? "AI Feedback" : "Console"}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-neutral-800">
                                {/* Console */}
                                {activeTab === "console" && (
                                    <div className="text-neutral-400">
                                        {error ? (
                                            <p className="text-red-400 whitespace-pre-line">{error}</p>
                                        ) : result && result.error_message ? (
                                            <div>
                                                <p className="text-red-400 mb-2">Runtime Error:</p>
                                                <p className="text-red-500 whitespace-pre-line bg-red-950/30 p-3 rounded">{result.error_message}</p>
                                            </div>
                                        ) : result ? (
                                            <p className="text-green-500">Execution successful! Check 'Test Cases' tab for test results.</p>
                                        ) : (
                                            <>
                                                <p className="mb-1">Console ready.</p>
                                                <p>{">"} Submit your code to see results.</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Test Results */}
                                {activeTab === "tests" && result && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                                            <span className={`font-bold text-xs uppercase tracking-widest ${result.status === "passed" || result.status === "accepted" ? "text-green-500" : "text-red-500"}`}>
                                                {result.status.replace("_", " ")}
                                            </span>
                                            <span className="text-neutral-400 text-xs">
                                                Tests: <span className="text-white ml-1">{result.passed_tests}/{result.total_tests}</span>
                                            </span>
                                        </div>
                                        {result.test_results?.map((test, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg border text-xs ${test.passed ? "bg-green-950/20 border-green-900/50" : "bg-red-950/20 border-red-900/50"}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-neutral-300 font-medium">Test {test.test_number || idx + 1}</span>
                                                    <span className={`font-bold uppercase ${test.passed ? "text-green-500" : "text-red-500"}`}>{test.passed ? "PASS" : "FAIL"}</span>
                                                </div>
                                                {!test.passed && (
                                                    <div className="space-y-1 text-neutral-400 mt-3 pt-3 border-t border-dashed border-red-900/50">
                                                        <p>Input: <span className="text-neutral-300">{test.input}</span></p>
                                                        <p>Expected: <span className="text-green-400">{test.expected}</span></p>
                                                        <p>Got: <span className="text-red-400">{test.actual ?? "(no output)"}</span></p>
                                                        {test.error && <p className="text-red-500 mt-2 bg-red-950/50 p-2 rounded">{test.error}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Feedback */}
                                {activeTab === "feedback" && result && (
                                    <div className="text-sm space-y-4">
                                        {result.feedback ? (
                                            <>
                                                <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-900 text-neutral-200">
                                                    <p className="text-xs font-mono uppercase text-blue-400 mb-2 font-semibold tracking-wide">AI Analysis</p>
                                                    <p className="text-sm font-sans leading-relaxed">{result.feedback.feedback_text}</p>
                                                </div>
                                                
                                                {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                                                    <div className="border border-yellow-900/50 rounded-lg p-4 bg-yellow-950/10">
                                                        <p className="text-xs font-mono uppercase text-yellow-500 mb-2 font-semibold tracking-wide">Suggestions ✨</p>
                                                        <ul className="space-y-2">
                                                            {result.feedback.suggestions.map((suggestion, idx) => (
                                                                <li key={idx} className="flex gap-2 text-sm text-neutral-300 font-sans">
                                                                    <span className="text-yellow-600 mt-0.5">•</span>
                                                                    <span>{suggestion}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-neutral-500 font-sans">No feedback generated for this submission.</p>
                                        )}
                                    </div>
                                )}

                                {/* Empty states */}
                                {activeTab === "tests" && !result && (
                                    <p className="text-neutral-500">{">"} Submit your code to see test results.</p>
                                )}
                                {activeTab === "feedback" && !result && (
                                    <p className="text-neutral-500">{">"} Submit your code to receive AI feedback.</p>
                                )}
                            </div>
                                </div>
                            </Panel>
                        </Group>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
