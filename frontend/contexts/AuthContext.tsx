"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getLogger } from "@/lib/logger";

const logger = getLogger("Auth");

// ─── Types ───────────────────────────────────────────────────────────────────

interface DBUser {
    id: number;
    firebase_uid: string;
    email: string;
    username: string;
    display_name: string;
    avatar_url: string;
    role: string;
    total_score: number;
    problems_solved: number;
    current_streak: number;
    bio?: string;
    has_gemini_key?: boolean;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    dbUser: DBUser | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    syncUserWithBackend: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DBUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync Firebase user to backend and get DB profile
    const syncWithBackend = async (firebaseUser: User): Promise<DBUser | null> => {
        try {
            logger.info("Syncing user with backend", { uid: firebaseUser.uid });
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                logger.error("Backend sync failed", { status: res.status });
                return null;
            }
            const profile = await res.json();
            logger.info("Backend sync successful", { username: profile.username });
            return profile;
        } catch (err) {
            logger.error("Backend sync error", err);
            return null;
        }
    };

    const syncUserWithBackend = async () => {
        if (user) {
            const profile = await syncWithBackend(user);
            setDbUser(profile);
        }
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                logger.info("Auth state changed: user signed in", { uid: firebaseUser.uid, email: firebaseUser.email });
                const profile = await syncWithBackend(firebaseUser);
                setDbUser(profile);
            } else {
                logger.info("Auth state changed: user signed out");
                setDbUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // ─── Auth Actions ──────────────────────────────────────────────────────────

    const signInWithEmail = async (email: string, password: string) => {
        logger.info("Signing in with email", { email });
        await signInWithEmailAndPassword(auth, email, password);
        logger.info("Email sign-in successful");
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        logger.info("Signing up with email", { email, displayName });
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        // Force re-sync after profile update
        await credential.user.reload();
        logger.info("Email sign-up successful", { uid: credential.user.uid });
    };

    const signInWithGoogle = async () => {
        logger.info("Signing in with Google");
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        logger.info("Google sign-in successful");
    };

    const signOut = async () => {
        logger.info("Signing out");
        await firebaseSignOut(auth);
        setDbUser(null);
        logger.info("Sign-out complete");
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            dbUser, 
            loading, 
            signInWithEmail, 
            signUpWithEmail, 
            signInWithGoogle, 
            signOut,
            syncUserWithBackend
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
