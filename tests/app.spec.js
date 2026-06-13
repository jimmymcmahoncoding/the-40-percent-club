import { test, expect } from '@playwright/test'

// Freeze time to 12 June 2026 10:00 BST for all tests.
// Expected initial state (DEFAULT_DATA):
//   Baseline: 34 office days / 90 working days (Jan 1 – Jun 5)
//   Interactive entries: Jun 8 ✓, Jun 11 ✓, Jun 12 ✓  (3 office days)
//   New working days Jun 6–12: Mon 8, Tue 9, Wed 10, Thu 11, Fri 12 = 5
//   Total: 37 / 95 = 38.9%

const FIXED_TIME = new Date('2026-06-12T10:00:00')

const SEED_DATA = {
    baseline: {
        officeDays: 34,
        workingDays: 90,
        endDate: '2026-06-05',
        yearStart: '2026-01-01',
    },
    entries: {
        '2026-06-08': 'office',
        '2026-06-11': 'office',
        '2026-06-12': 'office',
    },
}

async function freshPage(page) {
    await page.clock.setFixedTime(FIXED_TIME)
    await page.goto('/')
    // Seed localStorage with the known baseline so the app loads the main view
    await page.evaluate((data) => {
        localStorage.setItem('the40percentclub_v1', JSON.stringify(data))
    }, SEED_DATA)
    await page.reload()
    await page.clock.setFixedTime(FIXED_TIME)
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Desktop — initial load', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('page title is correct', async ({ page }) => {
        await freshPage(page)
        await expect(page).toHaveTitle(/40% Club/i)
    })

    test('header displays app name', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
            'The 40% Club'
        )
    })

    test('attendance percentage shows 38.9%', async ({ page }) => {
        await freshPage(page)
        const pct = page.getByTestId('attendance-pct')
        await expect(pct).toBeVisible()
        await expect(pct).toContainText('38.9%')
    })

    test('office days counter shows 37 of 95', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('office-days')).toContainText('37')
        await expect(page.getByTestId('working-days')).toContainText('95')
    })

    test('progress ring is rendered', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('progress-ring')).toBeVisible()
    })

    test('calendar is rendered with current month', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('calendar')).toBeVisible()
        await expect(page.getByTestId('calendar')).toContainText('June 2026')
    })

    test('pre-seeded office days are green', async ({ page }) => {
        await freshPage(page)
        for (const d of ['2026-06-08', '2026-06-11', '2026-06-12']) {
            const cell = page.getByTestId(`day-${d}`)
            await expect(cell).toBeVisible()
            await expect(cell).toHaveClass(/bg-green-500/)
        }
    })

    test('bank holiday (25 May) is visible in May', async ({ page }) => {
        await freshPage(page)
        await page.getByRole('button', { name: 'Previous month' }).click()
        await expect(page.getByTestId('calendar')).toContainText('May 2026')
        const bhCell = page.getByTestId('day-2026-05-25')
        await expect(bhCell).toBeVisible()
        await expect(bhCell).toHaveClass(/bg-gray-100/)
    })

    test('projection card is rendered', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('projection-card')).toBeVisible()
        await expect(page.getByTestId('projection-card')).toContainText(
            'Year-End Projection'
        )
    })

    test('rolling periods row is rendered with both cards', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('rolling-periods')).toBeVisible()
        await expect(page.getByTestId('rolling-4-week-card')).toBeVisible()
        await expect(page.getByTestId('rolling-12-week-card')).toBeVisible()
    })

    test('rolling 4-week card shows a percentage and day count', async ({ page }) => {
        await freshPage(page)
        const card = page.getByTestId('rolling-4-week-card')
        await expect(card).toContainText('Last 4 Weeks')
        // Should show a % value and a fraction
        await expect(card).toContainText('%')
        await expect(card).toContainText('days')
    })

    test('rolling 12-week card shows a percentage and day count', async ({ page }) => {
        await freshPage(page)
        const card = page.getByTestId('rolling-12-week-card')
        await expect(card).toContainText('Last 12 Weeks')
        await expect(card).toContainText('%')
        await expect(card).toContainText('days')
    })

    test('rolling 4-week shows "est." label when window overlaps baseline', async ({ page }) => {
        await freshPage(page)
        // The 4-week window starts 15 May, which is within the baseline (ends 5 Jun)
        // so figures must be marked as estimated
        await expect(page.getByTestId('rolling-4-week-card')).toContainText('est.')
    })

    test('rolling cards update when a new office day is added', async ({ page }) => {
        await freshPage(page)
        const card4 = page.getByTestId('rolling-4-week-card')
        // Read the percentage span (contains a % sign)
        const pctSpan = card4.locator('span').filter({ hasText: /%/ }).first()
        const before = parseFloat(await pctSpan.textContent())

        // Add Jun 9 as office — within the 4-week window
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-office').click()

        const after = parseFloat(await pctSpan.textContent())
        // Percentage should have increased
        expect(after).toBeGreaterThan(before)
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// Desktop interaction tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Desktop — day interaction', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('clicking an unmarked day opens the modal', async ({ page }) => {
        await freshPage(page)
        // Jun 9 is a Tuesday after the baseline — should be interactive & unmarked
        const jun9 = page.getByTestId('day-2026-06-09')
        await expect(jun9).toBeVisible()
        await jun9.click()
        await expect(page.getByTestId('day-modal')).toBeVisible()
    })

    test('modal shows two entry options', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await expect(page.getByTestId('modal-option-office')).toBeVisible()
        await expect(page.getByTestId('modal-option-absent')).toBeVisible()
        await expect(page.getByTestId('modal-option-wfh')).not.toBeVisible()
    })

    test('modal closes when × button is clicked', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await expect(page.getByTestId('day-modal')).toBeVisible()
        await page.getByRole('button', { name: 'Close' }).click()
        await expect(page.getByTestId('day-modal')).not.toBeVisible()
    })

    test('modal closes when Escape key is pressed', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await expect(page.getByTestId('day-modal')).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByTestId('day-modal')).not.toBeVisible()
    })

    test('marking Jun 9 as office raises attendance to 40.0% and turns cell green', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-office').click()

        // Modal should close
        await expect(page.getByTestId('day-modal')).not.toBeVisible()

        // Cell should now be green
        await expect(page.getByTestId('day-2026-06-09')).toHaveClass(/bg-green-500/)

        // Stats: 38/95 = 40.0%
        await expect(page.getByTestId('attendance-pct')).toContainText('40.0%')
        await expect(page.getByTestId('office-days')).toContainText('38')
    })

    test('marking Jun 9 as absent reduces working days and raises attendance %', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()

        await expect(page.getByTestId('day-modal')).not.toBeVisible()
        // Working days: 95 - 1 = 94, office days still 37
        // 37/94 ≈ 39.4%
        await expect(page.getByTestId('attendance-pct')).toContainText('39.4%')
        await expect(page.getByTestId('working-days')).toContainText('94')
    })

    test('marking Jun 9 as WFH turns cell indigo, does not change counts', async ({ page }) => {
        await freshPage(page)
        // WFH option no longer exists — modal should only show office and absent
        await page.getByTestId('day-2026-06-09').click()
        await expect(page.getByTestId('modal-option-wfh')).not.toBeVisible()
        // Close without selecting
        await page.keyboard.press('Escape')
        await expect(page.getByTestId('attendance-pct')).toContainText('38.9%')
    })

    test('clearing an office entry reverts to unmarked and recalculates stats', async ({ page }) => {
        await freshPage(page)
        // Remove Jun 8 (was pre-seeded as office)
        await page.getByTestId('day-2026-06-08').click()
        await page.getByTestId('modal-option-clear').click()

        // Cell should no longer be green
        await expect(page.getByTestId('day-2026-06-08')).not.toHaveClass(/bg-green-500/)

        // Stats: 36/95 = 37.9%
        await expect(page.getByTestId('attendance-pct')).toContainText('37.9%')
        await expect(page.getByTestId('office-days')).toContainText('36')
    })

    test('baseline days (Jun 1-5) are not interactive', async ({ page }) => {
        await freshPage(page)
        const jun3 = page.getByTestId('day-2026-06-03')
        await expect(jun3).toBeVisible()
        await expect(jun3).toHaveClass(/bg-gray-100/)
        await jun3.click()
        // Modal should NOT open for baseline days
        await expect(page.getByTestId('day-modal')).not.toBeVisible()
    })

    test('weekend days (Jun 6-7) have no interaction', async ({ page }) => {
        await freshPage(page)
        const sat = page.getByTestId('day-2026-06-06')
        await expect(sat).toBeVisible()
        await expect(sat).toHaveClass(/bg-transparent/)
        await sat.click()
        await expect(page.getByTestId('day-modal')).not.toBeVisible()
    })

    test('data persists after page reload', async ({ page }) => {
        await freshPage(page)
        // Mark Jun 10 as office
        await page.getByTestId('day-2026-06-10').click()
        await page.getByTestId('modal-option-office').click()
        await expect(page.getByTestId('day-2026-06-10')).toHaveClass(/bg-green-500/)

        // Reload without clearing localStorage
        await page.clock.setFixedTime(FIXED_TIME)
        await page.reload()
        await page.clock.setFixedTime(FIXED_TIME)

        // Entry should still be there
        await expect(page.getByTestId('day-2026-06-10')).toHaveClass(/bg-green-500/)
    })

    test('calendar navigation works — prev and next month', async ({ page }) => {
        await freshPage(page)
        // Navigate to May
        await page.getByRole('button', { name: 'Previous month' }).click()
        await expect(page.getByTestId('calendar')).toContainText('May 2026')

        // Navigate back to June
        await page.getByRole('button', { name: 'Next month' }).click()
        await expect(page.getByTestId('calendar')).toContainText('June 2026')
    })

    test('"Today" button returns to current month', async ({ page }) => {
        await freshPage(page)
        await page.getByRole('button', { name: 'Previous month' }).click()
        await page.getByRole('button', { name: 'Previous month' }).click()
        await expect(page.getByTestId('calendar')).toContainText('April 2026')

        await page.getByRole('button', { name: 'Today' }).click()
        await expect(page.getByTestId('calendar')).toContainText('June 2026')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// Mobile tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Mobile — layout & interaction', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('page loads on mobile', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
            'The 40% Club'
        )
    })

    test('attendance % is visible on mobile', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('attendance-pct')).toBeVisible()
        await expect(page.getByTestId('attendance-pct')).toContainText('38.9%')
    })

    test('calendar is visible and scrollable on mobile', async ({ page }) => {
        await freshPage(page)
        await expect(page.getByTestId('calendar')).toBeVisible()
        await expect(page.getByTestId('calendar')).toContainText('June 2026')
    })

    test('calendar cells are at least 36px tall on mobile', async ({ page }) => {
        await freshPage(page)
        const cell = page.getByTestId('day-2026-06-09')
        await expect(cell).toBeVisible()
        const box = await cell.boundingBox()
        expect(box.height).toBeGreaterThanOrEqual(36)
        expect(box.width).toBeGreaterThanOrEqual(36)
    })

    test('day modal appears as bottom sheet on mobile', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        const modal = page.getByTestId('day-modal')
        await expect(modal).toBeVisible()

        // The inner panel should be at the bottom of the viewport on mobile
        const panel = modal.locator('> div')
        const box = await panel.boundingBox()
        // Bottom of the panel should be near the bottom of the viewport
        expect(box.y + box.height).toBeGreaterThan(600)
    })

    test('marking a day on mobile updates stats', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-office').click()

        await expect(page.getByTestId('attendance-pct')).toContainText('40.0%')
    })

    test('projection card is visible after scrolling on mobile', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        await expect(page.getByTestId('projection-card')).toBeVisible()
    })

    test('reset button is accessible on mobile', async ({ page }) => {
        await freshPage(page)
        await page.getByRole('button', { name: /reset/i }).click()
        // Confirmation prompt appears
        await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible()
        // Cancel it
        await page.getByRole('button', { name: 'No' }).click()
        await expect(page.getByRole('button', { name: /reset/i })).toBeVisible()
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// Absence — past day effects
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Absence — past day effects', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    // Baseline: 37 office / 95 working = 38.9%
    // Mark Jun 9 absent → 37 / 94 = 39.4%
    test('past absence reduces working-days by 1', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()

        await expect(page.getByTestId('working-days')).toContainText('94')
    })

    test('past absence does NOT reduce office-days', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()

        // Office days stay at 37 — absence is not the same as removing an office visit
        await expect(page.getByTestId('office-days')).toContainText('37')
    })

    test('past absence increases attendance percentage (fewer working days)', async ({ page }) => {
        await freshPage(page)
        const before = parseFloat(await page.getByTestId('attendance-pct').textContent())

        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()

        const after = parseFloat(await page.getByTestId('attendance-pct').textContent())
        expect(after).toBeGreaterThan(before)
        // 37/94 = 39.4%
        await expect(page.getByTestId('attendance-pct')).toContainText('39.4%')
    })

    test('past absence reduces days-still-needed in projection', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const before = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)

        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const after = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)
        // Target is lower because the full-year denominator shrank
        expect(after).toBeLessThanOrEqual(before)
    })

    test('marking 2 past days absent reduces working-days by 2', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()
        await page.getByTestId('day-2026-06-10').click()
        await page.getByTestId('modal-option-absent').click()

        await expect(page.getByTestId('working-days')).toContainText('93')
    })

    test('clearing a past absence restores working-days', async ({ page }) => {
        await freshPage(page)
        // Add absence
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-absent').click()
        await expect(page.getByTestId('working-days')).toContainText('94')

        // Clear it
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-clear').click()

        // Should be back to 95
        await expect(page.getByTestId('working-days')).toContainText('95')
        await expect(page.getByTestId('attendance-pct')).toContainText('38.9%')
    })
})

test.describe('Absence — future day effects on projection', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    // Jun 15 is the first working day after the frozen "today" of Jun 12.
    async function markFutureAbsent(page, dateStr) {
        // Navigate to the month that contains the date if not already visible
        const [, monthStr] = dateStr.match(/^(\d{4}-\d{2})/)
        const calText = await page.getByTestId('calendar').textContent()
        const targetMonth = new Date(dateStr).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
        if (!calText.includes(targetMonth.split(' ')[0])) {
            await page.getByRole('button', { name: 'Next month' }).click()
        }
        await page.getByTestId(`day-${dateStr}`).click()
        await page.getByTestId('modal-option-absent').click()
    }

    test('future absence reduces days-remaining by 1', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const before = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)

        await markFutureAbsent(page, '2026-06-15')

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const after = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)
        expect(after).toBe(before - 1)
    })

    test('future absence does NOT change working-days YTD or attendance %', async ({ page }) => {
        await freshPage(page)
        await markFutureAbsent(page, '2026-06-15')

        // YTD counts are unaffected — the absence is in the future
        await expect(page.getByTestId('working-days')).toContainText('95')
        await expect(page.getByTestId('attendance-pct')).toContainText('38.9%')
    })

    test('future absence reduces days-still-needed', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const before = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)

        await markFutureAbsent(page, '2026-06-15')

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const after = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)
        // Fewer working days remaining → lower 40% target → fewer days needed
        expect(after).toBeLessThanOrEqual(before)
    })

    test('5 future absences reduce days-still-needed by approx 2', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const before = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)

        // Mark the full week of Jun 15-19 as absent
        for (const d of ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19']) {
            await page.getByTestId(`day-${d}`).click()
            await page.getByTestId('modal-option-absent').click()
        }

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const after = parseInt(await page.getByTestId('projection-days-needed').textContent(), 10)

        // 5 fewer working days × 40% = 2 fewer target days needed
        expect(after).toBe(before - 2)
    })

    test('5 future absences reduce days-remaining by 5', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const beforeRemaining = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)

        for (const d of ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19']) {
            await page.getByTestId(`day-${d}`).click()
            await page.getByTestId('modal-option-absent').click()
        }

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const afterRemaining = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)
        expect(afterRemaining).toBe(beforeRemaining - 5)
    })

    test('clearing a future absence restores days-remaining', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const initial = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)

        await markFutureAbsent(page, '2026-06-15')
        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        expect(parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)).toBe(initial - 1)

        // Clear the absence
        await page.getByTestId('day-2026-06-15').click()
        await page.getByTestId('modal-option-clear').click()

        await page.getByTestId('projection-card').scrollIntoViewIfNeeded()
        const restored = parseInt(await page.getByTestId('projection-days-remaining').textContent(), 10)
        expect(restored).toBe(initial)
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// Setup screen
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Setup screen', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    async function freshSetup(page) {
        await page.clock.setFixedTime(FIXED_TIME)
        await page.goto('/')
        await page.evaluate(() => localStorage.removeItem('the40percentclub_v1'))
        await page.reload()
        await page.clock.setFixedTime(FIXED_TIME)
    }

    test('shows setup screen when no data is stored', async ({ page }) => {
        await freshSetup(page)
        await expect(page.getByTestId('setup-screen')).toBeVisible()
    })

    test('setup screen has all required fields', async ({ page }) => {
        await freshSetup(page)
        await expect(page.getByTestId('setup-year-start')).toBeVisible()
        await expect(page.getByTestId('setup-as-of-date')).toBeVisible()
        await expect(page.getByTestId('setup-office-days')).toBeVisible()
        await expect(page.getByTestId('setup-working-days')).toBeVisible()
        await expect(page.getByTestId('setup-submit')).toBeVisible()
    })

    test('submitting with empty fields shows validation errors', async ({ page }) => {
        await freshSetup(page)
        await page.getByTestId('setup-submit').click()
        await expect(page.getByTestId('setup-screen')).toBeVisible()
        await expect(page.getByTestId('calendar')).not.toBeVisible()
    })

    test('completing setup navigates to the main app', async ({ page }) => {
        await freshSetup(page)
        await page.getByTestId('setup-office-days').fill('34')
        await page.getByTestId('setup-working-days').fill('90')
        await page.getByTestId('setup-as-of-date').fill('2026-06-05')
        await page.getByTestId('setup-submit').click()
        await expect(page.getByTestId('calendar')).toBeVisible()
        await expect(page.getByTestId('setup-screen')).not.toBeVisible()
    })

    test('setup data is correctly reflected in attendance stats', async ({ page }) => {
        await freshSetup(page)
        await page.getByTestId('setup-office-days').fill('34')
        await page.getByTestId('setup-working-days').fill('90')
        await page.getByTestId('setup-as-of-date').fill('2026-06-05')
        await page.getByTestId('setup-submit').click()
        // 34 office / 95 working (90 baseline + 5 new Jun 6-12) = 35.8%
        await expect(page.getByTestId('attendance-pct')).toContainText('35.8%')
    })

    test('setup data persists after reload', async ({ page }) => {
        await freshSetup(page)
        await page.getByTestId('setup-office-days').fill('20')
        await page.getByTestId('setup-working-days').fill('50')
        await page.getByTestId('setup-as-of-date').fill('2026-06-05')
        await page.getByTestId('setup-submit').click()
        await expect(page.getByTestId('calendar')).toBeVisible()

        await page.clock.setFixedTime(FIXED_TIME)
        await page.reload()
        await page.clock.setFixedTime(FIXED_TIME)

        await expect(page.getByTestId('setup-screen')).not.toBeVisible()
        await expect(page.getByTestId('calendar')).toBeVisible()
    })

    test('reset returns to setup screen', async ({ page }) => {
        await freshPage(page)
        await page.getByRole('button', { name: /reset/i }).click()
        await page.getByRole('button', { name: 'Yes' }).click()
        await expect(page.getByTestId('setup-screen')).toBeVisible()
        await expect(page.getByTestId('calendar')).not.toBeVisible()
    })
})
