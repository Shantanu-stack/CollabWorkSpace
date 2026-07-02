import React, { useState, useEffect } from 'react';

const FEATURE_DATA = [
    {
        id: 1,
        step: "1",
        tabTitle: "PROMETHEUS COMPATIBILITY",
        heading: "Your existing queries and pipelines work as-is",
        tabAccent: "border-t-pink-500",
        bullets: [
            "Prometheus Remote Write: point at Elasticsearch, data flows",
            "PromQL runs natively in Kibana, no translation layer",
            "Grafana queries Elasticsearch directly via native Prometheus API"
        ]
    },
    {
        id: 2,
        step: "2",
        tabTitle: "INFRASTRUCTURE CONTENT",
        heading: "Ready at ingest",
        tabAccent: "border-t-teal-400",
        bullets: [
            "K8s: dashboards, alert templates, ML anomaly jobs",
            "Workflows and SLO Templates pre-configured",
            "Metrics exploration in Discover: query and correlate without building dashboards"
        ]
    },
    {
        id: 3,
        step: "3",
        tabTitle: "AGENTIC INVESTIGATION",
        heading: "From alert to root cause in one backend",
        tabAccent: "border-t-blue-600",
        bullets: [
            "ES|QL queries across metrics, logs, and traces: no tool switching",
            "Observability MCP App: investigate from Claude, Cursor, or VS Code",
            "Agent Skills: pre-built investigation runbooks for K8s and more"
        ]
    }
];

export default function MetricsUI() {
    // Defaulting to dark mode to match your current vibe
    const [isDark, setIsDark] = useState(true);

    // Sync the 'dark' class to the HTML document when state changes
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        // Note: bg-transparent allows the math grid from index.css to show through
        <div className="min-h-screen p-8 md:p-16 bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* Header & Theme Toggle */}
            <div className="max-w-4xl mx-auto mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#0f172a] dark:text-white">
                        Now best-in-class for metrics
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400">
                        A columnar storage engine purpose-built for time series data.
                    </p>
                </div>

                <button
                    onClick={() => setIsDark(!isDark)}
                    className="px-4 py-2 text-sm font-bold border-2 border-slate-900 dark:border-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap bg-white dark:bg-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(100,116,139,1)]"
                >
                    {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                </button>
            </div>

            {/* Cards Container */}
            <div className="max-w-4xl mx-auto space-y-14">
                {FEATURE_DATA.map((feature) => (
                    <div key={feature.id} className="relative mt-8">

                        {/* The Solid Offset Shadow Background */}
                        <div className="absolute top-2.5 left-2.5 w-full h-full bg-[#1a2035] dark:bg-slate-700 rounded-xl"></div>

                        {/* Main Card Body */}
                        <div className="relative bg-white dark:bg-slate-900 border-[3px] border-[#1a2035] dark:border-slate-500 rounded-xl p-6 md:p-8">

                            {/* The "Folder Tab" sitting on top */}
                            <div className={`absolute -top-[35px] left-6 bg-white dark:bg-slate-900 border-[3px] border-b-0 border-[#1a2035] dark:border-slate-500 border-t-[6px] ${feature.tabAccent} px-4 py-1.5 rounded-t-lg flex items-center gap-2`}>
                <span className="font-bold text-xs md:text-sm tracking-widest uppercase text-slate-800 dark:text-slate-200">
                  {feature.step} · {feature.tabTitle}
                </span>
                            </div>

                            {/* Card Content */}
                            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 mt-2 text-[#1a2035] dark:text-white">
                                {feature.heading}
                            </h2>

                            <ul className="space-y-4">
                                {feature.bullets.map((bullet, idx) => {
                                    const [boldPart, restPart] = bullet.split(':');

                                    return (
                                        <li key={idx} className="flex items-start gap-3 text-base md:text-lg">
                                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-400 shrink-0"></div>
                                            <p>
                                                {restPart ? (
                                                    <>
                                                        <span className="font-bold text-[#1a2035] dark:text-white">{boldPart}:</span>
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{restPart}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-[#1a2035] dark:text-white">{bullet}</span>
                                                )}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}