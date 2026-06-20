import { useState } from 'react'
import {
    getDaysInMonth,
    getMondayOffset,
    formatMonthYear,
    isWeekend,
    isBankHoliday,
    getBankHolidayName,
    isWorkingDay,
    isToday,
    isFuture,
    today,
    addDays,
} from '../utils/dateUtils'
import DayModal from './DayModal'

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayCellClasses(dateStr, entryType, baselineStart, baselineEnd) {
    const todayHighlight = isToday(dateStr)
    const future = isFuture(dateStr)
    const weekend = isWeekend(dateStr)
    const bh = isBankHoliday(dateStr)
    const isBaselinePeriod = dateStr >= baselineStart && dateStr <= baselineEnd

    if (weekend) {
        return 'bg-transparent text-gray-300 dark:text-gray-700 cursor-default select-none'
    }
    if (bh) {
        return 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-default select-none'
    }
    if (isBaselinePeriod) {
        return 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-default select-none'
    }

    const ring = todayHighlight ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900' : ''
    const dimFuture = future ? 'opacity-50' : ''

    switch (entryType) {
        case 'office':
            return `bg-green-500 dark:bg-green-500 text-white font-bold cursor-pointer active:scale-95 ${ring} ${dimFuture}`
        case 'absent':
            return `bg-amber-400 dark:bg-amber-500 text-white font-bold cursor-pointer active:scale-95 ${ring} ${dimFuture}`
        default:
            return `${todayHighlight
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300'
                } cursor-pointer active:scale-95 border border-gray-200 dark:border-white/10 ${ring} ${dimFuture}`
    }
}

function DayCell({ dateStr, entryType, onClick, baselineStart, baselineEnd }) {
    const day = parseInt(dateStr.slice(8), 10)
    const bh = isBankHoliday(dateStr)
    const bhName = bh ? getBankHolidayName(dateStr) : null
    const isBaselinePeriod = dateStr >= baselineStart && dateStr <= baselineEnd
    const interactive = !isWeekend(dateStr) && !bh && !isBaselinePeriod

    const classes = getDayCellClasses(dateStr, entryType, baselineStart, baselineEnd)

    return (
        <div
            data-testid={`day-${dateStr}`}
            onClick={interactive ? () => onClick(dateStr) : undefined}
            title={
                bhName
                    ? `${bhName} (Bank Holiday)`
                    : isBaselinePeriod
                        ? 'Baseline period — not individually tracked'
                        : undefined
            }
            className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-150 select-none ${classes}`}
        >
            <span className="leading-none">{day}</span>
            {bh && <span className="text-[8px] leading-none mt-0.5 opacity-60">BH</span>}
            {isToday(dateStr) && !entryType && !isBaselinePeriod && !bh && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
            )}
        </div>
    )
}

export default function CalendarView({ entries, baseline, onSetEntry }) {
    const baselineStart = baseline.yearStart
    const baselineEnd = baseline.endDate
    const yearStr = baseline.yearStart.slice(0, 4)
    const minYear = parseInt(yearStr)
    const minMonth = parseInt(baseline.yearStart.slice(5, 7)) - 1 // 0-indexed
    const maxYear = minYear  // navigation capped to the tracking year
    const maxMonth = 11     // December

    const now = new Date()
    const [viewYear, setViewYear] = useState(now.getFullYear())
    const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed
    const [selectedDate, setSelectedDate] = useState(null)

    const atMin = viewYear === minYear && viewMonth === minMonth
    const atMax = viewYear === maxYear && viewMonth === maxMonth

    function prevMonth() {
        if (atMin) return
        if (viewMonth === 0) {
            setViewMonth(11)
            setViewYear((y) => y - 1)
        } else {
            setViewMonth((m) => m - 1)
        }
    }

    function nextMonth() {
        if (atMax) return
        if (viewMonth === 11) {
            setViewMonth(0)
            setViewYear((y) => y + 1)
        } else {
            setViewMonth((m) => m + 1)
        }
    }

    function goToToday() {
        setViewYear(now.getFullYear())
        setViewMonth(now.getMonth())
    }

    const days = getDaysInMonth(viewYear, viewMonth)
    const offset = getMondayOffset(viewYear, viewMonth) // empty Mon-first cells before day 1

    function handleDayClick(dateStr) {
        setSelectedDate(dateStr)
    }

    function handleSelect(type) {
        if (selectedDate) {
            onSetEntry(selectedDate, type)
        }
        setSelectedDate(null)
    }

    const isCurrentMonthView =
        viewYear === now.getFullYear() && viewMonth === now.getMonth()

    // Check if entire displayed month is within baseline period
    const monthLastDay = days[days.length - 1]
    const monthFirstDay = days[0]
    const overlapsBaseline = monthFirstDay <= baselineEnd && monthLastDay >= baselineStart
    const isFullBaseline = overlapsBaseline && monthFirstDay >= baselineStart && monthLastDay <= baselineEnd
    const isPartialBaseline = overlapsBaseline && !isFullBaseline

    return (
        <>
            <div className="card dark:bg-gray-900 dark:border-white/10" data-testid="calendar">
                {/* ── Header: navigation ── */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevMonth}
                        disabled={atMin}
                        aria-label="Previous month"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >‹</button>

                    <div className="text-center">
                        <h2 className="font-bold text-gray-900 dark:text-white text-base">
                            {formatMonthYear(viewYear, viewMonth)}
                        </h2>
                        {(isFullBaseline || isPartialBaseline) && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                {isFullBaseline ? 'Baseline — aggregated only' : 'Shaded = baseline period'}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={nextMonth}
                        disabled={atMax}
                        aria-label="Next month"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >›</button>
                </div>

                {/* Jump to today */}
                {!isCurrentMonthView && (
                    <div className="flex justify-center mb-3">
                        <button
                            onClick={goToToday}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                )}

                {/* ── Day-of-week headers ── */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAY_HEADERS.map((h) => (
                        <div
                            key={h}
                            className={`text-center text-[11px] font-semibold py-1 ${h === 'Sat' || h === 'Sun'
                                ? 'text-gray-300 dark:text-gray-700'
                                : 'text-gray-400 dark:text-gray-500'
                                }`}
                        >
                            {h}
                        </div>
                    ))}
                </div>

                {/* ── Day grid ── */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for Monday-first offset */}
                    {Array.from({ length: offset }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {days.map((dateStr) => (
                        <DayCell
                            key={dateStr}
                            dateStr={dateStr}
                            entryType={entries[dateStr] || null}
                            onClick={handleDayClick}
                            baselineStart={baselineStart}
                            baselineEnd={baselineEnd}
                        />
                    ))}
                </div>

                {/* ── Legend ── */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-x-3 gap-y-2 justify-center">
                    {[
                        { color: 'bg-green-500', label: 'Office' },
                        { color: 'bg-amber-400', label: 'Absent' },
                        { color: 'bg-gray-200 dark:bg-white/10', label: 'Bank Hol.' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1">
                            <span className={`w-2.5 h-2.5 rounded-md ${color} flex-shrink-0`} />
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day selection modal */}
            {selectedDate && (
                <DayModal
                    date={selectedDate}
                    currentType={entries[selectedDate] || null}
                    onSelect={handleSelect}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </>
    )
}
