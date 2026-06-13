import { today, addDays, countWorkingDays } from './dateUtils'

const YEAR_END = '2026-12-31'
const TARGET = 0.4

export function calculateStats(data) {
    if (!data) return null
    const { baseline, entries } = data
    const todayStr = today()

    // Count new office / absence entries in the interactive window (after baseline, up to today)
    let newOfficeDays = 0
    let newAbsenceDays = 0

    for (const [dateStr, type] of Object.entries(entries)) {
        if (dateStr > baseline.endDate && dateStr <= todayStr) {
            if (type === 'office') newOfficeDays++
            else if (type === 'absent') newAbsenceDays++
        }
    }

    // Working days from the day after baseline end to today
    const dayAfterBaseline = addDays(baseline.endDate, 1)
    let newWorkingDays = 0
    if (dayAfterBaseline <= todayStr) {
        const raw = countWorkingDays(dayAfterBaseline, todayStr)
        newWorkingDays = Math.max(0, raw - newAbsenceDays)
    }

    const totalOfficeDays = baseline.officeDays + newOfficeDays
    const totalWorkingDays = baseline.workingDays + newWorkingDays
    const attendancePct =
        totalWorkingDays > 0 ? (totalOfficeDays / totalWorkingDays) * 100 : 0

    // Current gap to 40%
    const targetSoFar = totalWorkingDays * TARGET
    const daysAheadNow = totalOfficeDays - targetSoFar // positive = ahead, negative = behind

    // ── Year-end projection ──────────────────────────────────────────────────
    const tomorrow = addDays(todayStr, 1)

    // Future absences already logged
    let futureAbsences = 0
    for (const [dateStr, type] of Object.entries(entries)) {
        if (dateStr > todayStr && type === 'absent') futureAbsences++
    }

    let remainingWorkingDays = 0
    if (tomorrow <= YEAR_END) {
        const rawRemaining = countWorkingDays(tomorrow, YEAR_END)
        remainingWorkingDays = Math.max(0, rawRemaining - futureAbsences)
    }

    const totalYearWorkingDays = totalWorkingDays + remainingWorkingDays
    const yearTargetOfficeDays = Math.ceil(totalYearWorkingDays * TARGET)
    const daysNeededForYear = Math.max(0, yearTargetOfficeDays - totalOfficeDays)
    const daysRemainingInYear = remainingWorkingDays

    // Rate required for the rest of the year
    const rateRequired =
        daysRemainingInYear > 0 ? (daysNeededForYear / daysRemainingInYear) * 100 : 0

    // Approximate weeks remaining
    const weeksRemaining = daysRemainingInYear / 5
    const daysPerWeekNeeded = weeksRemaining > 0 ? daysNeededForYear / weeksRemaining : 0

    // ── Rolling period stats (4-week and 12-week) ───────────────────────────
    const rolling4 = calcRollingWindow(28, todayStr, baseline, entries)
    const rolling12 = calcRollingWindow(84, todayStr, baseline, entries)

    return {
        totalOfficeDays,
        totalWorkingDays,
        attendancePct,
        isOnTarget: attendancePct >= 40,
        daysAheadNow,  // positive = ahead of 40%, negative = behind
        daysNeededForYear,
        daysRemainingInYear,
        totalYearWorkingDays,
        yearTargetOfficeDays,
        rateRequired,
        daysPerWeekNeeded,
        rolling4,
        rolling12,
        // kept for backward-compat with StatsPanel mini-stat
        rolling4Office: rolling4.officeDays,
        rolling4Working: rolling4.workingDays,
        rolling4Pct: rolling4.pct,
    }
}

/**
 * Calculate office attendance for a rolling window of `daysBack` calendar days
 * ending today (inclusive).  Where the window overlaps the locked baseline period,
 * office days are estimated by prorating the known baseline rate.
 */
function calcRollingWindow(daysBack, todayStr, baseline, entries) {
    const windowStart = addDays(todayStr, -(daysBack - 1))
    const baselineRate = baseline.officeDays / baseline.workingDays

    let officeDays = 0
    let workingDays = 0
    let isEstimated = false

    // ── Baseline overlap portion ─────────────────────────────────────────────
    if (windowStart <= baseline.endDate) {
        // Clamp window start to the very beginning of tracked data
        const bStart = windowStart < baseline.yearStart ? baseline.yearStart : windowStart
        const bEnd = baseline.endDate
        const bWorkingDays = countWorkingDays(bStart, bEnd)
        const bOfficeDays = Math.round(bWorkingDays * baselineRate)
        officeDays += bOfficeDays
        workingDays += bWorkingDays
        isEstimated = true
    }

    // ── Interactive portion (after baseline) ────────────────────────────────
    const interactiveStart =
        windowStart > baseline.endDate ? windowStart : addDays(baseline.endDate, 1)

    if (interactiveStart <= todayStr) {
        let periodAbsent = 0
        let periodOffice = 0
        for (const [dateStr, type] of Object.entries(entries)) {
            if (dateStr >= interactiveStart && dateStr <= todayStr) {
                if (type === 'office') periodOffice++
                else if (type === 'absent') periodAbsent++
            }
        }
        const rawWorking = countWorkingDays(interactiveStart, todayStr)
        workingDays += Math.max(0, rawWorking - periodAbsent)
        officeDays += periodOffice
    }

    const pct = workingDays > 0 ? (officeDays / workingDays) * 100 : null

    return { officeDays, workingDays, pct, isEstimated }
}
