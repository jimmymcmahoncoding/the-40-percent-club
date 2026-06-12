import ProgressRing from './ProgressRing'

export default function StatsPanel({ stats }) {
    const {
        totalOfficeDays,
        totalWorkingDays,
        attendancePct,
        isOnTarget,
        daysAheadNow,
        daysNeededForYear,
    } = stats

    // Progress bar: scale 0–100% where 40% is the "full" mark
    const barFill = Math.min(100, (attendancePct / 40) * 100)

    const statusBg = isOnTarget
        ? 'bg-green-50 border-green-100'
        : 'bg-amber-50 border-amber-100'
    const statusText = isOnTarget ? 'text-green-700' : 'text-amber-700'
    const statusSub = isOnTarget ? 'text-green-600' : 'text-amber-600'
    const statusBarColor = isOnTarget ? 'bg-green-500' : 'bg-amber-500'

    return (
        <div className="space-y-4">
            {/* Top row: ring + two cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* ── Attendance ring ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                    <ProgressRing percentage={attendancePct} />
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-400 inline-block flex-shrink-0" />
                        Target: 40%
                    </p>
                </div>

                {/* ── Office days count ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 font-medium">Office Days (YTD)</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2" data-testid="office-days">
                        {totalOfficeDays}
                        <span className="text-xl text-gray-400 font-normal">
                            {' '}/ <span data-testid="working-days">{totalWorkingDays}</span>
                        </span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">working days in period</p>

                    {/* Linear progress bar */}
                    <div className="mt-4">
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${statusBarColor}`}
                                style={{ width: `${barFill}%` }}
                                role="progressbar"
                                aria-valuenow={Math.round(attendancePct)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span className="text-orange-500 font-medium">40% target</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* ── Status card ── */}
                <div className={`rounded-2xl shadow-sm border p-6 flex flex-col justify-between ${statusBg}`}>
                    <p className={`text-sm font-semibold ${statusText}`}>
                        {isOnTarget ? '✓ On Target' : '⚠ Below Target'}
                    </p>

                    {isOnTarget ? (
                        <>
                            <p className={`text-4xl font-bold mt-2 ${statusText}`}>
                                +{Math.round(daysAheadNow)}
                            </p>
                            <p className={`text-sm mt-1 ${statusSub}`}>
                                {Math.round(daysAheadNow) === 1 ? 'day' : 'days'} ahead of 40%
                            </p>
                        </>
                    ) : (
                        <>
                            <p className={`text-4xl font-bold mt-2 ${statusText}`}>
                                {daysNeededForYear}
                            </p>
                            <p className={`text-sm mt-1 ${statusSub}`}>
                                more {daysNeededForYear === 1 ? 'day' : 'days'} needed to hit 40% for the year
                            </p>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}
