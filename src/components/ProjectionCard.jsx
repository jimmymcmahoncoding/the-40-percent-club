export default function ProjectionCard({ stats }) {
    const {
        totalOfficeDays,
        daysNeededForYear,
        daysRemainingInYear,
        totalYearWorkingDays,
        yearTargetOfficeDays,
        rateRequired,
        daysPerWeekNeeded,
    } = stats

    const progressToTarget = Math.min(100, (totalOfficeDays / yearTargetOfficeDays) * 100)
    const onTrackForYear = daysNeededForYear === 0

    return (
        <div className="card dark:bg-gray-900 dark:border-white/10" data-testid="projection-card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                <span>📈</span> Year-End Projection
            </h2>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                        {totalOfficeDays} of {yearTargetOfficeDays} target days
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                        {Math.round(progressToTarget)}%
                    </span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${onTrackForYear ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressToTarget}%` }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
                <Stat label="Full-year days" value={totalYearWorkingDays} sub="est." />
                <Stat label="Target days (40%)" value={yearTargetOfficeDays} accent />
                <Stat label="Days still needed" value={daysNeededForYear}
                    valueColor={daysNeededForYear > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-green-500 dark:text-green-400'} />
                <Stat label="Days remaining" value={daysRemainingInYear} sub="this year" />
            </div>

            {/* Guidance */}
            <div className={`rounded-2xl px-4 py-3.5 text-sm ${onTrackForYear
                ? 'bg-green-500/10 dark:bg-green-500/15 text-green-700 dark:text-green-300'
                : 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                }`}>
                {onTrackForYear ? (
                    <p>🎉 You've already hit your 40% target for the year — keep it up!</p>
                ) : (
                    <p>
                        Need <strong>{daysNeededForYear}</strong> more {daysNeededForYear === 1 ? 'day' : 'days'} from {daysRemainingInYear} remaining
                        — that's <strong>{rateRequired.toFixed(1)}%</strong>
                        {daysPerWeekNeeded > 0 && <> (<strong>{daysPerWeekNeeded.toFixed(1)} days/week</strong>)</>}.
                    </p>
                )}
            </div>
        </div>
    )
}

function Stat({ label, value, sub, accent, valueColor }) {
    return (
        <div className={`rounded-2xl p-3 text-center ${accent ? 'bg-indigo-500/10 dark:bg-indigo-500/15' : 'bg-gray-50 dark:bg-white/5'}`}>
            <p className={`text-2xl font-bold ${valueColor || (accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white')}`}>
                {value}
            </p>
            <p className={`text-[11px] mt-0.5 leading-tight ${accent ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {label}{sub && <span className="block opacity-70">{sub}</span>}
            </p>
        </div>
    )
}
