import { toDate } from './dateUtils'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function fmtDate(dateStr) {
    const d = toDate(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function exportCSV(data) {
    const { baseline, entries } = data
    const target = baseline.target ?? 40

    const headerLines = [
        ['The 40% Club — Attendance Export'],
        [`Generated`, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
        [`Baseline`, `${baseline.officeDays} office days / ${baseline.workingDays} working days`],
        [`Baseline period`, `${fmtDate(baseline.yearStart)} – ${fmtDate(baseline.endDate)}`],
        [`Attendance target`, `${target}%`],
        [],
        ['Date', 'Day of Week', 'Status'],
    ]

    const entryRows = Object.entries(entries)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([dateStr, type]) => {
            const dow = DAY_NAMES[toDate(dateStr).getDay()]
            const status = type === 'office' ? 'Office' : 'Absent / Holiday'
            return [dateStr, dow, status]
        })

    const allRows = [...headerLines, ...entryRows]

    const csv = allRows
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${baseline.yearStart.slice(0, 4)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
