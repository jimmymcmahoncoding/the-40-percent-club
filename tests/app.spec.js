import { test, expect } from '@playwright/test'

// Freeze time to 12 June 2026 10:00 BST for all tests.
// Expected initial state (DEFAULT_DATA):
//   Baseline: 34 office days / 90 working days (Jan 1 – Jun 5)
//   Interactive entries: Jun 8 ✓, Jun 11 ✓, Jun 12 ✓  (3 office days)
//   New working days Jun 6–12: Mon 8, Tue 9, Wed 10, Thu 11, Fri 12 = 5
//   Total: 37 / 95 = 38.9%

const FIXED_TIME = new Date('2026-06-12T10:00:00')

async function freshPage(page) {
    await page.clock.setFixedTime(FIXED_TIME)
    await page.goto('/')
    // Clear any stored data so we always start from the seeded defaults
    await page.evaluate(() => localStorage.clear())
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
        await expect(bhCell).toHaveClass(/bg-slate-100/)
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
        const before = await card4.locator('span').first().textContent()

        // Add Jun 9 as office — within the 4-week window
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-office').click()

        const after = await card4.locator('span').first().textContent()
        // Percentage should have increased
        expect(parseFloat(after)).toBeGreaterThan(parseFloat(before))
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

    test('modal shows three entry options', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await expect(page.getByTestId('modal-option-office')).toBeVisible()
        await expect(page.getByTestId('modal-option-wfh')).toBeVisible()
        await expect(page.getByTestId('modal-option-absent')).toBeVisible()
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

    test('marking Jun 9 as WFH turns cell blue, does not change counts', async ({ page }) => {
        await freshPage(page)
        await page.getByTestId('day-2026-06-09').click()
        await page.getByTestId('modal-option-wfh').click()

        await expect(page.getByTestId('day-2026-06-09')).toHaveClass(/bg-blue-500/)
        // WFH does not affect numerator or denominator
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
        await expect(sat).toHaveClass(/bg-slate-50/)
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
        await page.getByRole('button', { name: 'Cancel' }).click()
        await expect(page.getByRole('button', { name: /reset/i })).toBeVisible()
    })
})
