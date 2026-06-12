const TARGET = 40

function PeriodCard({ label, data, testId }) {
    if (!data || data.pct === null) return null

    const { officeDays, workingDays, pct, isEstimated } = data
    const onTarget = pct >= TARGET

    const ringColor = onTarget
        ? 'text-green-600'
        : pct >= 30
            ? 'text-amber-500'
            : 'text-red-500'

    const badgeBg = onTarget
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'

    // Simple horizontal bar
    const barFill = Math.min(100, (pct / TARGET) * 100)
    const barColor = onTarget ? 'bg-green-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400'

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3"
            data-testid={testId}
        >
            {/* Label + badge */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {onTarget ? 'On target' : 'Below target'}
                </span>
            </div>

            {/* Big % */}
            <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold leading-none ${ringColor}`}>
                    {pct.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-400 mb-0.5">
                    {officeDays}/{workingDays} days
                    {isEstimated && (
                        <span
                            className="ml-1 text-[10px] text-gray-400 align-super"
                            title="Includes estimated figures from the baseline period"
                        >
                            est.
                        </span>
                    )}
                </span>
            </div>

            {/* Progress bar */}
            <div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${barFill}%` }}
                    />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Target: 40%</p>
            </div>
        </div>
    )
}

export default function RollingPeriodsRow({ stats }) {
    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-testid="rolling-periods"
        >
            <PeriodCard
                label="Last 4 Weeks"
                data={stats.rolling4}
                testId="rolling-4-week-card"
            />
            <PeriodCard
                label="Last 12 Weeks"
                data={stats.rolling12}
                testId="rolling-12-week-card"
            />
        </div>
    )
}
