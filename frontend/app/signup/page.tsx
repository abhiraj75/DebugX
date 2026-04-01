"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getLogger } from "@/lib/logger";

const logger = getLogger("Signup");

export default function SignupPage() {
    const router = useRouter();
    const { user, loading: authLoading, signUpWithEmail, signInWithGoogle } = useAuth();
    
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", confirmPassword: "", agreeToTerms: false
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        if (!formData.username.trim()) { setError("Name is required"); setLoading(false); return; }
        if (!formData.email.trim()) { setError("Email is required"); setLoading(false); return; }
        if (!formData.password) { setError("Password is required"); setLoading(false); return; }
        if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
        if (formData.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        
        try {
            logger.info("Email signup attempt", { email: formData.email, displayName: formData.username });
            await signUpWithEmail(formData.email, formData.password, formData.username);
            logger.info("Email signup successful");
            router.push('/dashboard');
        } catch (err: any) {
            logger.warn("Email signup failed", { error: err.message });
            setError(friendlyError(err.message || 'Failed to create account. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            logger.info("Google signup attempt");
            await signInWithGoogle();
            logger.info("Google signup successful");
            router.push('/dashboard');
        } catch (err: any) {
            logger.warn("Google signup failed", { error: err.message });
            setError(friendlyError(err.message || 'Failed to sign up with Google.'));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-6 py-12">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-5">
                        <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-wide">DEBUGX</span>
                    </Link>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Create an account</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Start coding for free.</p>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-white dark:bg-neutral-900 shadow-sm">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-5 text-sm" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: "Full Name", type: "text", key: "username", placeholder: "Your name" },
                            { label: "Email", type: "email", key: "email", placeholder: "you@example.com" },
                            { label: "Password", type: "password", key: "password", placeholder: "At least 6 characters" },
                            { label: "Confirm Password", type: "password", key: "confirmPassword", placeholder: "••••••••" },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">{field.label}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className="w-full border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 placeholder-neutral-300 dark:placeholder-neutral-600 transition-colors"
                                    value={(formData as any)[field.key]}
                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex items-start gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-0.5 rounded border-neutral-300 dark:border-neutral-600 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                                checked={formData.agreeToTerms}
                                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                required
                            />
                            <label htmlFor="terms" className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed cursor-pointer">
                                I agree to the{" "}
                                <Link href="#" className="text-neutral-900 dark:text-white underline hover:no-underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="#" className="text-neutral-900 dark:text-white underline hover:no-underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium py-2.5 px-4 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={handleGoogleLogin} disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium disabled:opacity-50">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

                <p className="text-center mt-5 text-sm text-neutral-500 dark:text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-neutral-900 dark:text-white font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

function friendlyError(msg: string): string {
    if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
        return "Invalid email or password.";
    if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
    if (msg.includes("weak-password")) return "Password should be at least 6 characters.";
    if (msg.includes("invalid-email")) return "Please enter a valid email address.";
    if (msg.includes("too-many-requests")) return "Too many attempts. Please try again later.";
    return msg;
}
