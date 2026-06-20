import { useState, useCallback } from 'react'
import { loadData, saveData, resetData, initData } from './utils/storage'
import { calculateStats } from './utils/statsUtils'
import { exportCSV } from './utils/exportCSV'
import { today } from './utils/dateUtils'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import RollingPeriodsRow from './components/RollingPeriodsRow'
import CalendarView from './components/CalendarView'
import ProjectionCard from './components/ProjectionCard'
import MonthSummaryBar from './components/MonthSummaryBar'
import DayOfWeekChart from './components/DayOfWeekChart'
import YearRolloverBanner from './components/YearRolloverBanner'
import SetupScreen from './components/SetupScreen'

function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function App() {
    const [data, setData] = useState(() => loadData())
    const [rolloverDismissed, setRolloverDismissed] = useState(
        () => sessionStorage.getItem('rolloverDismissed') === '1'
    )

    const handleSetup = useCallback((baseline) => {
        setData(initData(baseline))
    }, [])

    const handleSetEntry = useCallback((dateStr, type) => {
        setData((prev) => {
            const newEntries = { ...prev.entries }
            if (type === null) {
                delete newEntries[dateStr]
            } else {
                newEntries[dateStr] = type
            }
            const updated = { ...prev, entries: newEntries }
            saveData(updated)
            return updated
        })
    }, [])

    const handleReset = useCallback(() => {
        sessionStorage.removeItem('rolloverDismissed')
        setData(resetData())
    }, [])

    const handleExport = useCallback(() => {
        if (data) exportCSV(data)
    }, [data])

    const handleDismissRollover = useCallback(() => {
        sessionStorage.setItem('rolloverDismissed', '1')
        setRolloverDismissed(true)
    }, [])

    if (!data) {
        return <SetupScreen onSetup={handleSetup} />
    }

    const stats = calculateStats(data)
    const yearEnd = `${data.baseline.yearStart.slice(0, 4)}-12-31`
    const isYearOver = today() > yearEnd

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Header onReset={handleReset} onExport={handleExport} baseline={data.baseline} />

            {isYearOver && !rolloverDismissed && (
                <YearRolloverBanner
                    year={data.baseline.yearStart.slice(0, 4)}
                    onStartNew={handleReset}
                    onDismiss={handleDismissRollover}
                />
            )}

            <main className="max-w-2xl mx-auto px-4 pt-5 pb-16 space-y-3">
                <StatsPanel stats={stats} />
                <RollingPeriodsRow stats={stats} />
                <MonthSummaryBar stats={stats} />
                <CalendarView
                    entries={data.entries}
                    baseline={data.baseline}
                    onSetEntry={handleSetEntry}
                />
                <ProjectionCard stats={stats} />
                <DayOfWeekChart stats={stats} />

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 pt-2">
                    Baseline: {data.baseline.officeDays} days / {data.baseline.workingDays} working days
                    {' '}· {fmtDate(data.baseline.yearStart)} – {fmtDate(data.baseline.endDate)}
                </p>
            </main>
        </div>
    )
}
