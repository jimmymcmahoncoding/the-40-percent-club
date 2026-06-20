export default function DayOfWeekChart({ stats }) {
    const { dowStats, target } = stats

    if (!dowStats || dowStats.length === 0) return null

    const hasAnyData = dowStats.some(d => d.workingDays > 0)
    if (!hasAnyData) return null

    const maxPct = Math.max(...dowStats.map(d => d.pct ?? 0), target)

    return (
        <div className="card dark:bg-gray-900 dark:border-white/10">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                <span>📊</span> Day-of-Week Breakdown
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 -mt-2">
                Which days you most commonly go in (interactive period only)
            </p>

            <div className="space-y-2.5">
                {dowStats.map(({ name, officeDays, workingDays, pct }) => {
                    const noData = workingDays === 0 || pct === null
                    const onTarget = !noData && pct >= target
                    const fill = noData ? 0 : Math.min(100, (pct / maxPct) * 100)

                    const barColor = noData
                        ? 'bg-gray-200 dark:bg-white/10'
                        : onTarget
                            ? 'bg-green-500'
                            : pct >= target - 10
                                ? 'bg-amber-400'
                                : 'bg-red-400'

                    const pctLabel = noData ? '—' : `${pct.toFixed(0)}%`

                    return (
                        <div key={name} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-7 flex-shrink-0">{name}</span>
                            <div className="flex-1 h-5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden relative">
                                {/* Target marker line */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-orange-400/50"
                                    style={{ left: `${Math.min(100, (target / maxPct) * 100)}%` }}
                                />
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${fill}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-9 text-right flex-shrink-0">
                                {pctLabel}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 w-12 flex-shrink-0">
                                {noData ? '' : `${officeDays}/${workingDays}`}
                            </span>
                        </div>
                    )
                })}
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                <span className="w-3 border-t border-orange-400/50 inline-block" />
                Orange line = {target}% target
            </p>
        </div>
    )
}
