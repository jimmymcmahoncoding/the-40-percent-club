// UK Bank Holidays for England & Wales 2026
export const UK_BANK_HOLIDAYS = {
    '2026-01-01': "New Year's Day",
    '2026-04-03': 'Good Friday',
    '2026-04-06': 'Easter Monday',
    '2026-05-04': 'Early May Bank Holiday',
    '2026-05-25': 'Spring Bank Holiday',
    '2026-08-31': 'Summer Bank Holiday',
    '2026-12-25': 'Christmas Day',
    '2026-12-28': 'Boxing Day',
}

export const BANK_HOLIDAY_SET = new Set(Object.keys(UK_BANK_HOLIDAYS))
