const STORAGE_KEY = 'the40percentclub_v1'

/**
 * Returns the stored data, or null if the user has not yet set up their baseline.
 * null triggers the SetupScreen.
 */
export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            const b = parsed?.baseline
            if (
                b?.officeDays != null &&
                b?.workingDays != null &&
                b?.yearStart &&
                b?.endDate &&
                parsed?.entries
            ) return parsed
        }
    } catch {
        // fall through
    }
    return null
}

export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
        // storage quota exceeded – silently ignore
    }
}

/** Create and persist a fresh dataset from a user-provided baseline. */
export function initData(baseline) {
    const data = { baseline, entries: {} }
    saveData(data)
    return data
}

/** Wipe all data — returns null to trigger the setup screen. */
export function resetData() {
    localStorage.removeItem(STORAGE_KEY)
    return null
}
