import { useEffect } from 'react'
import { formatDisplayDate } from '../utils/dateUtils'

const OPTIONS = [
    {
        type: 'office',
        emoji: '🏢',
        label: 'Office',
        bg: 'bg-green-500 hover:bg-green-600',
        ring: 'ring-2 ring-green-700 ring-offset-1',
    },
    {
        type: 'wfh',
        emoji: '💻',
        label: 'Work from Home',
        bg: 'bg-blue-500 hover:bg-blue-600',
        ring: 'ring-2 ring-blue-700 ring-offset-1',
    },
    {
        type: 'absent',
        emoji: '🌴',
        label: 'Absent / Holiday',
        bg: 'bg-amber-400 hover:bg-amber-500',
        ring: 'ring-2 ring-amber-600 ring-offset-1',
    },
]

export default function DayModal({ date, currentType, onSelect, onClose }) {
    // Hooks must be called unconditionally (before any early return)
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
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            data-testid="day-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Log attendance for ${formatDisplayDate(date)}`}
        >
            {/* Panel — slides up on mobile, centred on desktop */}
            <div
                className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                            Log attendance
                        </p>
                        <h3 className="font-semibold text-gray-900 text-base leading-snug">
                            {formatDisplayDate(date)}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none -mt-1"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Option buttons */}
                <div className="flex flex-col gap-3">
                    {OPTIONS.map(({ type, emoji, label, bg, ring }) => (
                        <button
                            key={type}
                            data-testid={`modal-option-${type}`}
                            onClick={() => onSelect(type)}
                            className={`flex items-center gap-3 text-white font-medium px-4 py-3 rounded-xl transition-all ${bg} ${currentType === type ? ring : ''}`}
                        >
                            <span className="text-xl">{emoji}</span>
                            <span>{label}</span>
                            {currentType === type && (
                                <span className="ml-auto text-sm opacity-80">✓ current</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Clear entry */}
                {currentType && (
                    <button
                        data-testid="modal-option-clear"
                        onClick={() => onSelect(null)}
                        className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
                    >
                        Clear entry
                    </button>
                )}
            </div>
        </div>
    )
}
