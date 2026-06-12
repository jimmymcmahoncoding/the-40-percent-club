import { useState, useCallback } from 'react'
import { loadData, saveData, resetData } from './utils/storage'
import { calculateStats } from './utils/statsUtils'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import RollingPeriodsRow from './components/RollingPeriodsRow'
import CalendarView from './components/CalendarView'
import ProjectionCard from './components/ProjectionCard'

export default function App() {
    const [data, setData] = useState(() => loadData())

    const stats = calculateStats(data)

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
        const fresh = resetData()
        setData(fresh)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Header onReset={handleReset} />

            <main className="max-w-2xl mx-auto px-4 pt-5 pb-16 space-y-3">
                <StatsPanel stats={stats} />
                <RollingPeriodsRow stats={stats} />
                <CalendarView
                    entries={data.entries}
                    baseline={data.baseline}
                    onSetEntry={handleSetEntry}
                />
                <ProjectionCard stats={stats} />

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 pt-2">
                    Baseline: 34 days / 90 working days · 1 Jan – 5 Jun 2026 · 17 absences
                </p>
            </main>
        </div>
    )
}
