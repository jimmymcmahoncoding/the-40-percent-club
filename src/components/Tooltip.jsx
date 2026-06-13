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

    // Keep bubble on-screen: right-anchored bubbles sit flush to the right of the
    // icon; left-anchored sit flush to the left; center tries to centre but is
    // clamped by the viewport via a negative margin trick.
    const bubbleCls =
        align === 'right'
            ? 'right-0'
            : align === 'left'
                ? 'left-0'
                : 'left-1/2 -translate-x-1/2'

    const arrowCls =
        align === 'right' ? 'right-2'
        : align === 'left' ? 'left-2'
        : 'left-1/2 -translate-x-1/2'

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
                    className={`absolute z-50 bottom-full ${bubbleCls} mb-2 w-56 max-w-[calc(100vw-2rem)] bg-gray-900 dark:bg-gray-800 text-white text-[11px] font-normal normal-case tracking-normal leading-relaxed rounded-xl px-3 py-2.5 shadow-xl pointer-events-none`}
                >
                    {text}
                    {/* Arrow */}
                    <span className={`absolute top-full ${arrowCls} border-4 border-transparent border-t-gray-900 dark:border-t-gray-800`} />
                </span>
            )}
        </span>
    )
}
