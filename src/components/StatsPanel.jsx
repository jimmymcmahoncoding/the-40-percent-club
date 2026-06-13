import ProgressRing from './ProgressRing'
import Tooltip from './Tooltip'

export default function StatsPanel({ stats }) {
    const {
        totalOfficeDays,
        totalWorkingDays,
        attendancePct,
        isOnTarget,
        daysAheadNow,
        daysNeededForYear,
    } = stats

    const barFill = Math.min(100, (attendancePct / 40) * 100)
    const barColor = isOnTarget ? 'bg-green-500' : attendancePct >= 30 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div className="space-y-3">
            {/* Ring + days — side by side on mobile */}
            <div className="grid grid-cols-2 gap-3">

                {/* ── Attendance ring ── */}
                <div className="card dark:bg-gray-900 dark:border-white/10 flex flex-col items-center justify-center py-5">
                    <ProgressRing percentage={attendancePct} size={148} />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block flex-shrink-0" />
                        40% target
                        <Tooltip align="center" text="Your YTD office attendance %. The orange dot marks the 40% target. Green = on target, amber = within 10 points, red = more than 10 points below." />
                    </p>
                </div>

                {/* ── Office days ── */}
                <div className="card dark:bg-gray-900 dark:border-white/10 flex flex-col justify-between py-5">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center">
                        Office Days
                        <Tooltip align="right" text="Days in the office ÷ total working days available this year. Working days exclude weekends, bank holidays, and days you've marked as absent." />
                    </p>
                    <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2 leading-none" data-testid="office-days">
                            {totalOfficeDays}
                        </p>
                        <p className="text-base text-gray-400 dark:text-gray-500 mt-1">
                            of <span data-testid="working-days" className="text-gray-600 dark:text-gray-300 font-semibold">{totalWorkingDays}</span> days
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                style={{ width: `${barFill}%` }}
                                role="progressbar"
                                aria-valuenow={Math.round(attendancePct)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">YTD · target 40%</p>
                    </div>
                </div>
            </div>

            {/* ── Status banner ── */}
            <div className={`rounded-2xl px-4 py-4 flex items-center justify-between gap-3 ${isOnTarget
                ? 'bg-green-500/10 dark:bg-green-500/15 border border-green-500/20'
                : 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20'
                }`}>
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isOnTarget ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isOnTarget ? '✓ On Target' : '⚠ Below Target'}
                    </p>
                    <p className={`text-sm ${isOnTarget ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {isOnTarget
                            ? `${Math.round(daysAheadNow)} ${Math.round(daysAheadNow) === 1 ? 'day' : 'days'} ahead of target`
                            : `${daysNeededForYear} more ${daysNeededForYear === 1 ? 'day' : 'days'} needed to hit 40% this year`
                        }
                    </p>
                </div>
                <span className={`text-3xl font-black leading-none flex-shrink-0 ${isOnTarget ? 'text-green-500' : 'text-amber-500'}`}>
                    {isOnTarget ? `+${Math.round(daysAheadNow)}` : daysNeededForYear}
                </span>
            </div>
        </div>
    )
}
