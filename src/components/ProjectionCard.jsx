import { useState } from 'react'
import Tooltip from './Tooltip'

export default function ProjectionCard({ stats }) {
    const {
        target,
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

    // ── What-If simulator ────────────────────────────────────────────────────
    const [showWhatIf, setShowWhatIf] = useState(false)
    const defaultSim = Math.min(5, Math.max(0, Math.round(daysPerWeekNeeded * 2) / 2))
    const [simDaysPerWeek, setSimDaysPerWeek] = useState(defaultSim)

    const weeksRemaining = daysRemainingInYear / 5
    const simAdditional = Math.round(simDaysPerWeek * weeksRemaining)
    const simTotal = totalOfficeDays + simAdditional
    const simPct = totalYearWorkingDays > 0 ? (simTotal / totalYearWorkingDays) * 100 : 0
    const simOnTarget = simTotal >= yearTargetOfficeDays

    return (
        <div className="card dark:bg-gray-900 dark:border-white/10" data-testid="projection-card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                <span>📈</span> Year-End Projection
                <Tooltip align="right" text={`Forecasts how many more office days you need to finish the year at ${target}%, based on working days remaining to 31 Dec.`} />
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
                <Stat label="Full-year days" value={totalYearWorkingDays} sub="est." testId="projection-year-working-days"
                    tooltip="Your YTD working days plus remaining working days to 31 Dec (minus pre-logged absences). Used as the base for the target calculation."
                    tooltipAlign="left" />
                <Stat label={`Target days (${target}%)`} value={yearTargetOfficeDays} accent testId="projection-target-days"
                    tooltip={`Full-year days × ${target}%, rounded up — the minimum office visits needed to hit the ${target}% target by 31 Dec.`}
                    tooltipAlign="right" />
                <Stat label="Days still needed" value={daysNeededForYear}
                    valueColor={daysNeededForYear > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-green-500 dark:text-green-400'}
                    testId="projection-days-needed"
                    tooltip="Target days minus office days you've already done. Drops each time you log an office visit, or when you pre-log a future absence."
                    tooltipAlign="left" />
                <Stat label="Days remaining" value={daysRemainingInYear} sub="this year" testId="projection-days-remaining"
                    tooltip="Working days left from tomorrow to 31 Dec, minus any future absences you've already pre-logged on the calendar."
                    tooltipAlign="right" />
            </div>

            {/* Guidance */}
            <div className={`rounded-2xl px-4 py-3.5 text-sm mb-3 ${onTrackForYear
                ? 'bg-green-500/10 dark:bg-green-500/15 text-green-700 dark:text-green-300'
                : 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                }`}>
                {onTrackForYear ? (
                    <p>🎉 You've already hit your {target}% target for the year — keep it up!</p>
                ) : rateRequired > 100 ? (
                    <p>⚠️ Hitting {target}% by year-end is no longer mathematically possible — but keep going to minimise the gap.</p>
                ) : (
                    <p>
                        You need <strong>{daysNeededForYear}</strong> more office {daysNeededForYear === 1 ? 'day' : 'days'} from your <strong>{daysRemainingInYear}</strong> remaining working {daysRemainingInYear === 1 ? 'day' : 'days'} — a rate of <strong>{rateRequired.toFixed(1)}%</strong>{daysPerWeekNeeded > 0 && <>, or roughly <strong>{daysPerWeekNeeded.toFixed(1)} days in the office per week</strong></>}.
                    </p>
                )}
            </div>

            {/* ── What-If simulator ── */}
            <button
                onClick={() => setShowWhatIf(v => !v)}
                className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 py-2 px-1 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
                <span>🔮 What-If Simulator</span>
                <span className="text-gray-400 dark:text-gray-500">{showWhatIf ? '▲' : '▼'}</span>
            </button>

            {showWhatIf && (
                <div className="mt-2 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 px-4 py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        If I go in <strong className="text-gray-800 dark:text-white">{simDaysPerWeek} {simDaysPerWeek === 1 ? 'day' : 'days'}</strong> per week for the rest of the year…
                    </p>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={simDaysPerWeek}
                        onChange={e => setSimDaysPerWeek(Number(e.target.value))}
                        className="w-full accent-indigo-600 mb-4"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-center flex-1">
                            <p className={`text-2xl font-bold ${simOnTarget ? 'text-green-500 dark:text-green-400' : 'text-amber-500 dark:text-amber-400'}`}>
                                {simPct.toFixed(1)}%
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Projected year-end</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{simTotal}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Total office days</p>
                        </div>
                        <div className={`flex-1 text-center rounded-xl py-2 text-xs font-semibold ${simOnTarget
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                            {simOnTarget ? `✓ Hits ${target}%` : `${Math.max(0, yearTargetOfficeDays - simTotal)} short`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, sub, accent, valueColor, testId, tooltip, tooltipAlign = 'center' }) {
    return (
        <div className={`rounded-2xl p-3 text-center ${accent ? 'bg-indigo-500/10 dark:bg-indigo-500/15' : 'bg-gray-50 dark:bg-white/5'}`}>
            <p className={`text-2xl font-bold ${valueColor || (accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white')}`}
                data-testid={testId}>
                {value}
            </p>
            <p className={`text-[11px] mt-0.5 leading-tight flex items-center justify-center gap-0.5 ${accent ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <span>{label}{sub && <span className="block opacity-70">{sub}</span>}</span>
                {tooltip && <Tooltip text={tooltip} align={tooltipAlign} />}
            </p>
        </div>
    )
}
