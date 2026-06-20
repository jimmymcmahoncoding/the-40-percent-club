import { today, addDays, countWorkingDays, isWorkingDay, toDate } from './dateUtils'

const DEFAULT_TARGET = 40

function firstOfMonth(y, m) {
    return `${y}-${String(m + 1).padStart(2, '0')}-01`
}

function lastOfMonth(y, m) {
    return addDays(firstOfMonth(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1), -1)
}

export function calculateStats(data) {
    if (!data) return null
    const { baseline, entries } = data
    const todayStr = today()
    const YEAR_END = `${baseline.yearStart.slice(0, 4)}-12-31`
    const target = baseline.target ?? DEFAULT_TARGET
    const TARGET = target / 100

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

    // Current gap to target
    const targetSoFar = totalWorkingDays * TARGET
    const daysAheadNow = totalOfficeDays - targetSoFar // positive = ahead, negative = behind

    // ── Year-end projection ──────────────────────────────────────────────────
    const tomorrow = addDays(todayStr, 1)

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

    const rateRequired =
        daysRemainingInYear > 0 ? (daysNeededForYear / daysRemainingInYear) * 100 : 0

    const weeksRemaining = daysRemainingInYear / 5
    const daysPerWeekNeeded = weeksRemaining > 0 ? daysNeededForYear / weeksRemaining : 0

    // ── Rolling period stats (4-week and 12-week) ───────────────────────────
    const rolling4 = calcRollingWindow(28, todayStr, baseline, entries)
    const rolling12 = calcRollingWindow(84, todayStr, baseline, entries)

    // ── Monthly breakdown ────────────────────────────────────────────────────
    const monthlyStats = calcMonthlyStats(baseline, entries, todayStr, YEAR_END)

    // ── Day-of-week breakdown ────────────────────────────────────────────────
    const dowStats = calcDayOfWeekStats(baseline, entries, todayStr)

    return {
        target,
        totalOfficeDays,
        totalWorkingDays,
        attendancePct,
        isOnTarget: attendancePct >= target,
        daysAheadNow,
        daysNeededForYear,
        daysRemainingInYear,
        totalYearWorkingDays,
        yearTargetOfficeDays,
        rateRequired,
        daysPerWeekNeeded,
        rolling4,
        rolling12,
        monthlyStats,
        dowStats,
        // kept for backward-compat with StatsPanel mini-stat
        rolling4Office: rolling4.officeDays,
        rolling4Working: rolling4.workingDays,
        rolling4Pct: rolling4.pct,
    }
}

/**
 * Calculate office attendance for a rolling window of `daysBack` calendar days
 * ending today (inclusive). Where the window overlaps the locked baseline period,
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

/**
 * Calculate per-month office attendance from yearStart through the current month.
 * Baseline months are prorated; post-baseline months use logged entries.
 */
function calcMonthlyStats(baseline, entries, todayStr, YEAR_END) {
    const startYear = parseInt(baseline.yearStart.slice(0, 4))
    const startMonth = parseInt(baseline.yearStart.slice(5, 7)) - 1 // 0-indexed
    const endYear = parseInt(YEAR_END.slice(0, 4))
    const baselineRate = baseline.officeDays / baseline.workingDays

    const months = []
    let y = startYear
    let m = startMonth

    while (true) {
        const rawFirst = firstOfMonth(y, m)
        const last = lastOfMonth(y, m)

        if (rawFirst > todayStr) break
        if (rawFirst > YEAR_END) break

        // Clamp to yearStart for the opening month (yearStart may be mid-month)
        const first = rawFirst < baseline.yearStart ? baseline.yearStart : rawFirst
        const isCurrent = rawFirst <= todayStr && last >= todayStr
        const effectiveEnd = isCurrent ? todayStr : (last > YEAR_END ? YEAR_END : last)

        const isFullBaseline = effectiveEnd <= baseline.endDate
        const crossesBaseline = first <= baseline.endDate && effectiveEnd > baseline.endDate

        let officeDays = 0
        let workingDays = 0
        let isEstimated = false

        if (isFullBaseline) {
            const wd = countWorkingDays(first, effectiveEnd)
            officeDays = Math.round(wd * baselineRate)
            workingDays = wd
            isEstimated = true
        } else if (crossesBaseline) {
            // Baseline portion
            const bWd = countWorkingDays(first, baseline.endDate)
            officeDays = Math.round(bWd * baselineRate)
            workingDays = bWd
            isEstimated = true
            // Interactive portion
            const iStart = addDays(baseline.endDate, 1)
            let absent = 0, office = 0
            for (const [dateStr, type] of Object.entries(entries)) {
                if (dateStr >= iStart && dateStr <= effectiveEnd) {
                    if (type === 'office') office++
                    else if (type === 'absent') absent++
                }
            }
            const rawWd = countWorkingDays(iStart, effectiveEnd)
            workingDays += Math.max(0, rawWd - absent)
            officeDays += office
        } else {
            // Pure interactive
            let absent = 0, office = 0
            for (const [dateStr, type] of Object.entries(entries)) {
                if (dateStr >= first && dateStr <= effectiveEnd) {
                    if (type === 'office') office++
                    else if (type === 'absent') absent++
                }
            }
            const rawWd = countWorkingDays(first, effectiveEnd)
            workingDays = Math.max(0, rawWd - absent)
            officeDays = office
        }

        months.push({
            year: y,
            month: m,
            officeDays,
            workingDays,
            pct: workingDays > 0 ? (officeDays / workingDays) * 100 : null,
            isEstimated,
            isCurrent,
        })

        if (m === 11) { y++; m = 0 } else m++
        if (y > endYear) break
    }

    return months
}

/**
 * Count how often each weekday (Mon–Fri) was an office day in the interactive
 * period (after baseline.endDate, up to today).
 */
function calcDayOfWeekStats(baseline, entries, todayStr) {
    const interactiveStart = addDays(baseline.endDate, 1)
    if (interactiveStart > todayStr) return []

    const officeCounts = [0, 0, 0, 0, 0] // Mon–Fri
    const workingCounts = [0, 0, 0, 0, 0]

    let cur = interactiveStart
    while (cur <= todayStr) {
        if (isWorkingDay(cur)) {
            const dow = toDate(cur).getDay() // 0=Sun … 6=Sat
            if (dow >= 1 && dow <= 5) {
                const idx = dow - 1
                workingCounts[idx]++
                if (entries[cur] === 'office') officeCounts[idx]++
            }
        }
        cur = addDays(cur, 1)
    }

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, i) => ({
        name,
        officeDays: officeCounts[i],
        workingDays: workingCounts[i],
        pct: workingCounts[i] > 0 ? (officeCounts[i] / workingCounts[i]) * 100 : null,
    }))
}
