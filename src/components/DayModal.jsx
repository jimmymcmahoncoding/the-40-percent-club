import { useEffect } from 'react'
import { formatDisplayDate } from '../utils/dateUtils'

const OPTIONS = [
    {
        type: 'office',
        emoji: '🏢',
        label: 'Office',
        cls: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
        ring: 'ring-2 ring-offset-2 ring-green-600',
    },
    {
        type: 'absent',
        emoji: '🌴',
        label: 'Absent / Holiday',
        cls: 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600',
        ring: 'ring-2 ring-offset-2 ring-amber-500',
    },
]

export default function DayModal({ date, currentType, onSelect, onClose }) {
    useEffect(() => {
        if (!date) return
        function handleKey(e) {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [date, onClose])

    if (!date) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            data-testid="day-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Log attendance for ${formatDisplayDate(date)}`}
        >
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-gray-200 dark:border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-5" />

                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-0.5">
                            Log attendance
                        </p>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                            {formatDisplayDate(date)}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-lg"
                        aria-label="Close"
                    >
                        x
                    </button>
                </div>

                <div className="flex flex-col gap-2.5">
                    {OPTIONS.map(({ type, emoji, label, cls, ring }) => (
                        <button
                            key={type}
                            data-testid={`modal-option-${type}`}
                            onClick={() => onSelect(type)}
                            className={`flex items-center gap-3 text-white font-semibold px-4 py-3.5 rounded-2xl transition-all ${cls} ${currentType === type ? ring : ''}`}
                        >
                            <span className="text-xl w-7 text-center">{emoji}</span>
                            <span className="flex-1 text-left">{label}</span>
                            {currentType === type && <span className="text-sm opacity-75">✓</span>}
                        </button>
                    ))}
                </div>

                {currentType && (
                    <button
                        data-testid="modal-option-clear"
                        onClick={() => onSelect(null)}
                        className="mt-4 w-full text-center text-sm text-gray-400 dark:text-gray-500 py-2 font-medium"
                    >
                        Clear entry
                    </button>
                )}
            </div>
        </div>
    )
}
