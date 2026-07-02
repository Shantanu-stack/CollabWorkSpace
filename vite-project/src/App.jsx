import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import Dashboard from './Dashboard';
import MetricsUI from './components/MetricsUI'; // 👈 Just one clean import here

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-medium text-neutral-400">Loading workspace...</p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    // 👇 Wrap them in an empty fragment or div so React lets you return both
    return (
        <>
            <Dashboard user={user} />
            <MetricsUI />
        </>
    );
}