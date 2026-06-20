// UK Bank Holidays for England & Wales 2025–2027
export const UK_BANK_HOLIDAYS = {
    // 2025
    '2025-01-01': "New Year's Day",
    '2025-04-18': 'Good Friday',
    '2025-04-21': 'Easter Monday',
    '2025-05-05': 'Early May Bank Holiday',
    '2025-05-26': 'Spring Bank Holiday',
    '2025-08-25': 'Summer Bank Holiday',
    '2025-12-25': 'Christmas Day',
    '2025-12-26': 'Boxing Day',
    // 2026
    '2026-01-01': "New Year's Day",
    '2026-04-03': 'Good Friday',
    '2026-04-06': 'Easter Monday',
    '2026-05-04': 'Early May Bank Holiday',
    '2026-05-25': 'Spring Bank Holiday',
    '2026-08-31': 'Summer Bank Holiday',
    '2026-12-25': 'Christmas Day',
    '2026-12-28': 'Boxing Day',
    // 2027
    '2027-01-01': "New Year's Day",
    '2027-03-26': 'Good Friday',
    '2027-03-29': 'Easter Monday',
    '2027-05-03': 'Early May Bank Holiday',
    '2027-05-31': 'Spring Bank Holiday',
    '2027-08-30': 'Summer Bank Holiday',
    '2027-12-27': 'Christmas Day',
    '2027-12-28': 'Boxing Day',
}

export const BANK_HOLIDAY_SET = new Set(Object.keys(UK_BANK_HOLIDAYS))
