import { useState } from 'react'

export default function Header({ onReset }) {
    const [confirming, setConfirming] = useState(false)

    function handleReset() {
        onReset()
        setConfirming(false)
    }

    return (
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg">
            <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        🏢 The 40% Club
                    </h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        Office Attendance Tracker · 2026
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {confirming ? (
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                            <span className="text-white text-sm">Reset all data?</span>
                            <button
                                onClick={handleReset}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirming(true)}
                            aria-label="Reset all data to baseline"
                            className="text-indigo-200 hover:text-white text-sm transition-colors px-2 py-1 rounded"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
