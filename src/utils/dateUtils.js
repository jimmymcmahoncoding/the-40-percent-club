import { BANK_HOLIDAY_SET, UK_BANK_HOLIDAYS } from './bankHolidays'

/** Returns today's date as YYYY-MM-DD in local time */
export function today() {
    const d = new Date()
    return fromDate(d)
}

/** Parse a YYYY-MM-DD string to a local Date object */
export function toDate(str) {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
}

/** Format a Date object as YYYY-MM-DD */
export function fromDate(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Add n days to a YYYY-MM-DD string */
export function addDays(dateStr, n) {
    const d = toDate(dateStr)
    d.setDate(d.getDate() + n)
    return fromDate(d)
}

export function isWeekend(dateStr) {
    const dow = toDate(dateStr).getDay()
    return dow === 0 || dow === 6
}

export function isBankHoliday(dateStr) {
    return BANK_HOLIDAY_SET.has(dateStr)
}

export function getBankHolidayName(dateStr) {
    return UK_BANK_HOLIDAYS[dateStr] || null
}

export function isWorkingDay(dateStr) {
    return !isWeekend(dateStr) && !isBankHoliday(dateStr)
}

export function isToday(dateStr) {
    return dateStr === today()
}

export function isFuture(dateStr) {
    return dateStr > today()
}

/** Count working days between two dates (inclusive) */
export function countWorkingDays(startStr, endStr) {
    if (startStr > endStr) return 0
    let count = 0
    let cur = startStr
    while (cur <= endStr) {
        if (isWorkingDay(cur)) count++
        cur = addDays(cur, 1)
    }
    return count
}

/** Return an array of YYYY-MM-DD strings for every day in the given month */
export function getDaysInMonth(year, month) {
    // month is 0-indexed
    const result = []
    const d = new Date(year, month, 1)
    while (d.getMonth() === month) {
        result.push(fromDate(d))
        d.setDate(d.getDate() + 1)
    }
    return result
}

/**
 * Monday-first column offset for the first day of a month.
 * Returns 0 for Monday, 1 for Tuesday, ..., 6 for Sunday.
 */
export function getMondayOffset(year, month) {
    const dow = new Date(year, month, 1).getDay() // 0=Sun … 6=Sat
    return (dow + 6) % 7
}

/** Format a YYYY-MM-DD string as a human-readable date in British English */
export function formatDisplayDate(dateStr) {
    return toDate(dateStr).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

/** Format a year + 0-indexed month as "June 2026" etc. */
export function formatMonthYear(year, month) {
    return new Date(year, month, 1).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    })
}
