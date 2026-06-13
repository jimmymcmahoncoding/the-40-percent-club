import Tooltip from './Tooltip'

const TARGET = 40

function PeriodCard({ label, data, testId, tooltip }) {
    if (!data || data.pct === null) return null

    const { officeDays, workingDays, pct, isEstimated } = data
    const onTarget = pct >= TARGET

    const pctColor = onTarget
        ? 'text-green-500 dark:text-green-400'
        : pct >= 30
            ? 'text-amber-500 dark:text-amber-400'
            : 'text-red-500 dark:text-red-400'

    const badgeCls = onTarget
        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'

    const barFill = Math.min(100, (pct / TARGET) * 100)
    const barColor = onTarget ? 'bg-green-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400'

    return (
        <div className="card dark:bg-gray-900 dark:border-white/10" data-testid={testId}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center">
                    {label}
                    {tooltip && <Tooltip align="left" text={tooltip} />}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}>
                    {onTarget ? 'On target' : 'Below target'}
                </span>
            </div>

            <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-bold leading-none ${pctColor}`}>
                    {pct.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 leading-tight">
                    {officeDays}/{workingDays} days
                    {isEstimated && (
                        <span
                            className="ml-1 text-[9px] align-super text-gray-400 dark:text-gray-600"
                            title="Includes estimates from baseline"
                        >est.</span>
                    )}
                </span>
            </div>

            <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${barFill}%` }}
                />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Target: 40%</p>
        </div>
    )
}

export default function RollingPeriodsRow({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-3" data-testid="rolling-periods">
            <PeriodCard
                label="Last 4 Weeks"
                data={stats.rolling4}
                testId="rolling-4-week-card"
                tooltip="Attendance over the past 28 days. Figures marked 'est.' are estimated by prorating your YTD rate across days that fall within your baseline period."
            />
            <PeriodCard
                label="Last 12 Weeks"
                data={stats.rolling12}
                testId="rolling-12-week-card"
                tooltip="Attendance over the past 84 days. Figures marked 'est.' are estimated by prorating your YTD rate across days that fall within your baseline period."
            />
        </div>
    )
}
