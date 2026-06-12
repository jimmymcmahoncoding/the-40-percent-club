const STORAGE_KEY = 'the40percentclub_v1'

/**
 * The baseline captures the employer's data snapshot up to 5 June 2026.
 *
 * Verified figures:
 *   Weekdays  1 Jan – 5 Jun 2026 = 112
 *   Bank holidays in period = 5  (1 Jan, 3 Apr, 6 Apr, 4 May, 25 May)
 *   Potential working days = 107
 *   Recorded absences = 17
 *   Net working days = 107 − 17 = 90  ✓  (matches screenshot)
 *   Office swipes = 34  →  34/90 = 37.8%  ✓
 */
export const DEFAULT_DATA = {
    baseline: {
        yearStart: '2026-01-01',
        endDate: '2026-06-05',
        officeDays: 34,
        absenceDays: 17,
        workingDays: 90,
    },
    // Individual day entries logged after the baseline period.
    // Values: 'office' | 'wfh' | 'absent'
    entries: {
        '2026-06-08': 'office',
        '2026-06-11': 'office',
        '2026-06-12': 'office',
    },
}

export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && parsed.baseline && parsed.entries) return parsed
        }
    } catch {
        // fall through to default
    }
    return structuredClone(DEFAULT_DATA)
}

export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
        // storage quota exceeded – silently ignore
    }
}

export function resetData() {
    localStorage.removeItem(STORAGE_KEY)
    return structuredClone(DEFAULT_DATA)
}
