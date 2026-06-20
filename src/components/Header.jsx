import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function SunIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
    )
}

function DownloadIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
    )
}

export default function Header({ onReset, onExport, baseline }) {
    const [confirming, setConfirming] = useState(false)
    const { dark, setDark } = useTheme()

    const year = baseline?.yearStart?.slice(0, 4) ?? new Date().getFullYear()
    const target = baseline?.target ?? 40

    function handleReset() {
        onReset()
        setConfirming(false)
    }

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-white/10 sticky top-0 z-40">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

                {/* Brand */}
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight truncate">
                        🏢 The {target}% Club
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        Office Attendance Tracker · {year}
                    </p>
                    <p className="text-[10px] text-indigo-400 dark:text-indigo-400 leading-tight tracking-wide">
                        jimmymcmahoncoding™
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setDark(d => !d)}
                        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        {dark ? <SunIcon /> : <MoonIcon />}
                    </button>

                    {/* Export CSV */}
                    {onExport && (
                        <button
                            onClick={onExport}
                            aria-label="Export attendance as CSV"
                            title="Export CSV"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            <DownloadIcon />
                        </button>
                    )}

                    {/* Reset */}
                    {confirming ? (
                        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-2.5 py-1.5">
                            <span className="text-red-700 dark:text-red-300 text-xs font-medium">Reset?</span>
                            <button
                                onClick={handleReset}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs px-1.5 py-1 rounded-lg transition-colors"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirming(true)}
                            aria-label="Reset all data to baseline"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-base"
                            title="Reset data"
                        >
                            ↺
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
