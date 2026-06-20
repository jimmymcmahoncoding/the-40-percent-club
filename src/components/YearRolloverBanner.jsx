export default function YearRolloverBanner({ year, onStartNew, onDismiss }) {
    return (
        <div className="bg-indigo-600 text-white px-4 py-4">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <p className="font-bold text-sm">🎆 {year} has ended!</p>
                    <p className="text-xs text-indigo-200 mt-0.5">
                        Start tracking a new year, or keep reviewing your {year} data.
                    </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={onStartNew}
                        className="bg-white text-indigo-700 font-semibold text-xs px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                        Start New Year
                    </button>
                    <button
                        onClick={onDismiss}
                        className="text-indigo-200 hover:text-white text-xs px-3 py-2 rounded-xl transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}
