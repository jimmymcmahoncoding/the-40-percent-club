import { useState } from 'react'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthSummaryBar({ stats }) {
    const { monthlyStats, target } = stats
    const [hovered, setHovered] = useState(null)

    if (!monthlyStats || monthlyStats.length === 0) return null

    return (
        <div className="card dark:bg-gray-900 dark:border-white/10">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                <span>📅</span> Monthly Breakdown
            </h2>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {monthlyStats.map((m) => {
                    const onTarget = m.pct !== null && m.pct >= target
                    const noData = m.pct === null || m.workingDays === 0

                    const barPct = noData ? 0 : Math.min(100, (m.pct / target) * 100)

                    const barColor = noData
                        ? 'bg-gray-200 dark:bg-white/10'
                        : onTarget
                            ? 'bg-green-500'
                            : m.pct >= target - 10
                                ? 'bg-amber-400'
                                : 'bg-red-400'

                    const labelColor = noData
                        ? 'text-gray-300 dark:text-gray-600'
                        : onTarget
                            ? 'text-green-600 dark:text-green-400'
                            : m.pct >= target - 10
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-500 dark:text-red-400'

                    const isHovered = hovered === `${m.year}-${m.month}`

                    return (
                        <div
                            key={`${m.year}-${m.month}`}
                            className="relative flex flex-col items-center flex-shrink-0 cursor-default"
                            style={{ minWidth: 36 }}
                            onMouseEnter={() => setHovered(`${m.year}-${m.month}`)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Tooltip */}
                            {isHovered && (
                                <div className="absolute bottom-full mb-2 z-10 bg-gray-900 dark:bg-gray-800 text-white text-[11px] rounded-xl px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none left-1/2 -translate-x-1/2">
                                    <p className="font-semibold">{MONTH_ABBR[m.month]} {m.year}</p>
                                    {noData
                                        ? <p className="text-gray-400">No data yet</p>
                                        : <>
                                            <p>{m.officeDays}/{m.workingDays} days{m.isEstimated ? ' (est.)' : ''}</p>
                                            <p className={onTarget ? 'text-green-400' : 'text-amber-400'}>
                                                {m.pct.toFixed(1)}% {onTarget ? '✓' : `(need ${target}%)`}
                                            </p>
                                        </>
                                    }
                                    {/* Arrow */}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                                </div>
                            )}

                            {/* Bar track */}
                            <div className="w-7 h-16 bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden flex flex-col justify-end">
                                <div
                                    className={`w-full rounded-lg transition-all duration-500 ${barColor}`}
                                    style={{ height: `${barPct}%` }}
                                />
                            </div>

                            {/* Target line overlay */}
                            <div className="absolute w-7 flex items-end pointer-events-none" style={{ bottom: 20, height: 64 }}>
                                <div className="w-full border-t-2 border-dashed border-orange-400/60" style={{ marginBottom: '0%' }} />
                            </div>

                            {/* Label */}
                            <p className={`text-[10px] font-semibold mt-1.5 ${m.isCurrent ? 'text-indigo-500 dark:text-indigo-400' : labelColor}`}>
                                {MONTH_ABBR[m.month]}
                            </p>
                            {!noData && (
                                <p className={`text-[9px] ${labelColor}`}>
                                    {m.pct.toFixed(0)}%
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> On target</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Within 10%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Below</span>
                <span className="flex items-center gap-1 ml-auto"><span className="w-3 border-t-2 border-dashed border-orange-400/60 inline-block" /> {target}% target</span>
            </div>
        </div>
    )
}
