export default function ProjectionCard({ stats }) {
    const {
        totalOfficeDays,
        totalWorkingDays,
        attendancePct,
        daysNeededForYear,
        daysRemainingInYear,
        totalYearWorkingDays,
        yearTargetOfficeDays,
        rateRequired,
        daysPerWeekNeeded,
        isOnTarget,
    } = stats

    const progressToTarget = Math.min(
        100,
        (totalOfficeDays / yearTargetOfficeDays) * 100
    )

    const onTrackForYear = daysNeededForYear === 0

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6"
            data-testid="projection-card"
        >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📈</span>
                Year-End Projection
            </h2>

            {/* Progress bar toward annual target */}
            <div className="mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">
                        {totalOfficeDays} of {yearTargetOfficeDays} target office days
                    </span>
                    <span className="font-medium text-gray-700">
                        {Math.round(progressToTarget)}%
                    </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${onTrackForYear ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                        style={{ width: `${progressToTarget}%` }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat
                    label="Full-year working days"
                    value={totalYearWorkingDays}
                    sub="(est.)"
                />
                <Stat
                    label="Target office days (40%)"
                    value={yearTargetOfficeDays}
                    highlight
                />
                <Stat
                    label="Days still needed"
                    value={daysNeededForYear}
                    valueColor={daysNeededForYear > 0 ? 'text-amber-600' : 'text-green-600'}
                />
                <Stat
                    label="Remaining working days"
                    value={daysRemainingInYear}
                    sub="this year"
                />
            </div>

            {/* Guidance message */}
            <div
                className={`mt-5 rounded-xl p-4 text-sm ${onTrackForYear
                        ? 'bg-green-50 text-green-800'
                        : 'bg-indigo-50 text-indigo-800'
                    }`}
            >
                {onTrackForYear ? (
                    <p>
                        🎉 You have already met your 40% target for the year — keep it up!
                    </p>
                ) : (
                    <p>
                        To hit <strong>40%</strong> by 31 December, you need{' '}
                        <strong>{daysNeededForYear}</strong> more office{' '}
                        {daysNeededForYear === 1 ? 'day' : 'days'} from{' '}
                        {daysRemainingInYear} remaining working days — that's{' '}
                        <strong>{rateRequired.toFixed(1)}%</strong> of your remaining time
                        {daysPerWeekNeeded > 0 && (
                            <>
                                {' '}
                                (roughly{' '}
                                <strong>{daysPerWeekNeeded.toFixed(1)} days per week</strong>)
                            </>
                        )}
                        .
                    </p>
                )}
            </div>
        </div>
    )
}

function Stat({ label, value, sub, highlight, valueColor }) {
    return (
        <div
            className={`rounded-xl p-3 text-center ${highlight ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
        >
            <p className={`text-2xl font-bold ${valueColor || (highlight ? 'text-indigo-700' : 'text-gray-800')}`}>
                {value}
            </p>
            <p className={`text-xs mt-0.5 leading-tight ${highlight ? 'text-indigo-600' : 'text-gray-500'}`}>
                {label}
                {sub && <span className="block text-gray-400">{sub}</span>}
            </p>
        </div>
    )
}
