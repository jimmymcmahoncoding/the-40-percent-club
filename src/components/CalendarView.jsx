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

const BASELINE_END = '2026-06-05'
const YEAR_START = '2026-01-01'
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayCellClasses(dateStr, entryType) {
    const todayStr = today()
    const todayHighlight = isToday(dateStr)
    const future = isFuture(dateStr)
    const weekend = isWeekend(dateStr)
    const bh = isBankHoliday(dateStr)
    const baseline = dateStr >= YEAR_START && dateStr <= BASELINE_END

    if (weekend) {
        return 'bg-slate-50 text-slate-300 cursor-default select-none'
    }
    if (bh) {
        return 'bg-slate-100 text-slate-400 cursor-default select-none'
    }
    if (baseline) {
        return 'bg-gray-100 text-gray-400 cursor-default select-none border border-gray-200'
    }

    // Interactive day
    const ring = todayHighlight ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
    const dimFuture = future ? 'opacity-60' : ''

    switch (entryType) {
        case 'office':
            return `bg-green-500 text-white font-semibold cursor-pointer hover:bg-green-600 ${ring} ${dimFuture}`
        case 'wfh':
            return `bg-blue-500 text-white font-semibold cursor-pointer hover:bg-blue-600 ${ring} ${dimFuture}`
        case 'absent':
            return `bg-amber-400 text-white font-semibold cursor-pointer hover:bg-amber-500 ${ring} ${dimFuture}`
        default:
            return `${todayHighlight ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'} text-gray-700 cursor-pointer border border-gray-200 ${ring} ${dimFuture}`
    }
}

function DayCell({ dateStr, entryType, onClick }) {
    const day = parseInt(dateStr.slice(8), 10)
    const bh = isBankHoliday(dateStr)
    const bhName = bh ? getBankHolidayName(dateStr) : null
    const baseline = dateStr >= YEAR_START && dateStr <= BASELINE_END
    const interactive = !isWeekend(dateStr) && !bh && !baseline

    const classes = getDayCellClasses(dateStr, entryType)

    return (
        <div
            data-testid={`day-${dateStr}`}
            onClick={interactive ? () => onClick(dateStr) : undefined}
            title={
                bhName
                    ? `${bhName} (Bank Holiday)`
                    : baseline
                        ? 'Baseline period — not individually tracked'
                        : undefined
            }
            className={`
        relative aspect-square flex flex-col items-center justify-center
        rounded-lg text-sm transition-all duration-150 select-none
        ${classes}
      `}
        >
            <span className="leading-none">{day}</span>
            {bh && (
                <span className="text-[9px] leading-none mt-0.5 text-slate-400 hidden sm:block">
                    BH
                </span>
            )}
            {baseline && (
                <span className="text-[8px] leading-none mt-0.5 text-gray-400 hidden sm:block">
                    —
                </span>
            )}
            {isToday(dateStr) && !entryType && !baseline && !bh && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
            )}
        </div>
    )
}

export default function CalendarView({ entries, baseline, onSetEntry }) {
    const now = new Date()
    const [viewYear, setViewYear] = useState(now.getFullYear())
    const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed
    const [selectedDate, setSelectedDate] = useState(null)

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11)
            setViewYear((y) => y - 1)
        } else {
            setViewMonth((m) => m - 1)
        }
    }

    function nextMonth() {
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
    const isFullBaseline = monthLastDay <= BASELINE_END
    const isPartialBaseline = monthFirstDay <= BASELINE_END && monthLastDay > BASELINE_END

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
                data-testid="calendar"
            >
                {/* ── Header: navigation ── */}
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={prevMonth}
                        aria-label="Previous month"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ‹
                    </button>

                    <div className="text-center">
                        <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                            {formatMonthYear(viewYear, viewMonth)}
                        </h2>
                        {isFullBaseline && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                Baseline period — aggregated data only
                            </p>
                        )}
                        {isPartialBaseline && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                Shaded days are in the baseline period
                            </p>
                        )}
                    </div>

                    <button
                        onClick={nextMonth}
                        aria-label="Next month"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ›
                    </button>
                </div>

                {/* Jump to today */}
                {!isCurrentMonthView && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={goToToday}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-full border border-indigo-200 hover:border-indigo-400 transition-colors"
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
                            className={`text-center text-xs font-medium py-1 ${h === 'Sat' || h === 'Sun' ? 'text-slate-300' : 'text-gray-400'
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
                        />
                    ))}
                </div>

                {/* ── Legend ── */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {[
                        { color: 'bg-green-500', label: 'Office' },
                        { color: 'bg-blue-500', label: 'WFH' },
                        { color: 'bg-amber-400', label: 'Absent' },
                        { color: 'bg-slate-100 border border-slate-200', label: 'Bank Holiday' },
                        { color: 'bg-gray-100 border border-gray-200', label: 'Baseline' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded ${color} flex-shrink-0`} />
                            <span className="text-xs text-gray-500">{label}</span>
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
