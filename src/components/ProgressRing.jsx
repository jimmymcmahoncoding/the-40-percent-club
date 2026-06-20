/**
 * SVG circular progress ring.
 * Starts at 12 o'clock and fills clockwise.
 * An orange marker is drawn at the target % position.
 */
export default function ProgressRing({ percentage, size = 164, strokeWidth = 14, target = 40 }) {
    const radius = (size - strokeWidth) / 2
    const cx = size / 2
    const cy = size / 2

    function polarToCartesian(angleDeg) {
        const rad = ((angleDeg - 90) * Math.PI) / 180
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        }
    }

    function arcPath(startDeg, endDeg) {
        const safEnd = endDeg >= 360 ? 359.99 : endDeg
        const s = polarToCartesian(startDeg)
        const e = polarToCartesian(safEnd)
        const large = safEnd - startDeg > 180 ? 1 : 0
        return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${radius} ${radius} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`
    }

    const clamped = Math.min(100, Math.max(0, percentage))
    const endDeg = (clamped / 100) * 360
    const targetPos = polarToCartesian((target / 100) * 360)

    const arcColor =
        percentage >= target
            ? '#22c55e'   // green-500
            : percentage >= target - 10
                ? '#f59e0b'   // amber-500
                : '#ef4444'   // red-500

    const textColor =
        percentage >= target
            ? 'text-green-500'
            : percentage >= target - 10
                ? 'text-amber-500'
                : 'text-red-500'

    return (
        <div
            className="relative inline-flex items-center justify-center"
            data-testid="progress-ring"
        >
            <svg width={size} height={size} aria-hidden="true">
                {/* Track */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-white/10"
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                {clamped > 0 && (
                    <path
                        d={arcPath(0, endDeg)}
                        fill="none"
                        stroke={arcColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                )}
                {/* Target marker */}
                <circle
                    cx={targetPos.x}
                    cy={targetPos.y}
                    r={strokeWidth / 2 + 2}
                    fill="white"
                    stroke="#f97316"
                    strokeWidth={2.5}
                />
            </svg>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className={`text-3xl font-bold leading-none ${textColor}`} data-testid="attendance-pct">
                    {percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">YTD</span>
            </div>
        </div>
    )
}
