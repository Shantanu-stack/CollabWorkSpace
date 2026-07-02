import React from 'react';
import { signInWithPopup, signInAnonymously } from 'firebase/auth'; // Added signInAnonymously
import { auth, googleProvider, githubProvider } from './firebase';
import toast, { Toaster } from 'react-hot-toast';
import myLogo from './utils/logo.png';
export default function Login() {
    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            toast.error("Google sign-in failed.");
        }
    };

    const handleGithubSignIn = async () => {
        try {
            await signInWithPopup(auth, githubProvider);
        } catch (error) {
            console.error("Error signing in with GitHub:", error.message);
            toast.error("GitHub sign-in failed.");
        }
    };

    // The new Guest Login function
    const handleGuestSignIn = async () => {
        try {
            const result = await signInAnonymously(auth);
            // We can optionally set a fake display name for the guest session
            result.user.displayName = "Guest User";
            toast.success("Welcome, Guest!");
        } catch (error) {
            console.error("Error signing in as guest:", error.message);
            toast.error("Guest login is not enabled in Firebase console.");
        }
    };

    return (
        // Added bg-transparent so the index.css math grid shows through
        <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[Helvetica,Arial,sans-serif] transition-colors duration-300">

            <Toaster position="bottom-right" />

            {/* Header Section with Geometric Logo */}
            {/* Header Section with Geometric Logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                    <img
                        src={myLogo}
                        alt="Nexus Workspace Logo"
                        className="h-24 w-auto object-contain rounded-2xl bg-white p-2 shadow-lg dark:shadow-white/10"
                    />
                </div>

                <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Nexus Workspace
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500 dark:text-neutral-400">
                    Sign in to access your enterprise dashboard
                </p>
            </div>

            {/* Elevated Login Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div
                    className="bg-white dark:bg-neutral-900 py-8 px-4 shadow-xl dark:shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-slate-200 dark:border-neutral-800 sm:rounded-xl sm:px-10 transition-colors">
                    <div className="space-y-4">

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 dark:border-neutral-700 rounded-lg bg-slate-50 dark:bg-neutral-900 text-sm font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-slate-500 transition-all duration-200"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* GitHub Button */}
                        <button
                            onClick={handleGithubSignIn}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white dark:text-neutral-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-slate-900 dark:focus:ring-white transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-3 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                            Continue with GitHub
                        </button>

                        {/* Guest Login Button (Recruiter Mode) */}
                        <button
                            onClick={handleGuestSignIn}
                            className="w-full flex justify-center items-center py-2.5 px-4 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-lg bg-transparent text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none transition-all duration-200"
                        >
                            🚀 Try it out as a Guest
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-neutral-800" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white dark:bg-neutral-900 text-slate-400 dark:text-neutral-500 uppercase tracking-wider transition-colors">
                                  Secure Access
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Links */}
                <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500 dark:text-neutral-500">
                    <a href="#" className="hover:text-slate-900 dark:hover:text-neutral-300 transition-colors">Privacy Policy</a>
                    <span>&middot;</span>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-neutral-300 transition-colors">Terms of Service</a>
                </div>

            </div>
        </div>
    );
}