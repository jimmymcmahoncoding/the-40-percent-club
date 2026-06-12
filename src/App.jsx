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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <Header onReset={handleReset} />

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-5 pb-12">
                <StatsPanel stats={stats} />
                <RollingPeriodsRow stats={stats} />
                <CalendarView
                    entries={data.entries}
                    baseline={data.baseline}
                    onSetEntry={handleSetEntry}
                />
                <ProjectionCard stats={stats} />

                {/* Baseline info footer */}
                <p className="text-center text-xs text-gray-400 pb-2">
                    Baseline data: 34 office days / 90 working days (1 Jan – 5 Jun 2026) ·{' '}
                    17 recorded absence days · YTD target: 40%
                </p>
            </main>
        </div>
    )
}
