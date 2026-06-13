import { useState, useRef, useEffect } from 'react'

/**
 * Small info-icon tooltip.
 * Shows on hover (desktop) or tap (mobile).
 * align: 'center' | 'left' | 'right' — controls which edge the bubble anchors to.
 */
export default function Tooltip({ text, align = 'center' }) {
    const [open, setOpen] = useState(false)
    const btnRef = useRef(null)

    useEffect(() => {
        if (!open) return
        function onOutside(e) {
            if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('pointerdown', onOutside)
        return () => document.removeEventListener('pointerdown', onOutside)
    }, [open])

    const posCls =
        align === 'right' ? 'right-0' :
        align === 'left'  ? 'left-0'  :
        'left-1/2 -translate-x-1/2'

    return (
        <span className="relative inline-flex items-center ml-1">
            <button
                ref={btnRef}
                type="button"
                aria-label="More information"
                className="w-4 h-4 inline-flex items-center justify-center text-[11px] leading-none text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus:outline-none select-none"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
            >
                ⓘ
            </button>
            {open && (
                <span
                    role="tooltip"
                    className={`absolute z-50 bottom-full ${posCls} mb-2 w-52 bg-gray-900 dark:bg-gray-800 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-xl pointer-events-none`}
                >
                    {text}
                    {/* Arrow */}
                    <span className={`absolute top-full ${align === 'right' ? 'right-3' : align === 'left' ? 'left-3' : 'left-1/2 -translate-x-1/2'} border-4 border-transparent border-t-gray-900 dark:border-t-gray-800`} />
                </span>
            )}
        </span>
    )
}
