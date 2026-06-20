import { useState } from 'react'
import { today, addDays } from '../utils/dateUtils'

function todayMinus1() {
    return addDays(today(), -1)
}

function jan1() {
    return `${new Date().getFullYear()}-01-01`
}

function Field({ label, hint, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            {children}
            {hint && !error && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>
            )}
            {error && (
                <p className="text-[11px] text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}

const inputCls =
    'w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors'

const inputErrCls =
    'w-full bg-red-50 dark:bg-red-900/10 border border-red-400 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors'

export default function SetupScreen({ onSetup }) {
    const [yearStart, setYearStart] = useState(jan1)
    const [asOfDate, setAsOfDate] = useState(todayMinus1)
    const [officeDays, setOfficeDays] = useState('')
    const [workingDays, setWorkingDays] = useState('')
    const [target, setTarget] = useState('40')
    const [errors, setErrors] = useState({})

    function validate() {
        const errs = {}
        if (!yearStart) errs.yearStart = 'Required'
        if (!asOfDate) errs.asOfDate = 'Required'
        if (yearStart && asOfDate && yearStart >= asOfDate)
            errs.asOfDate = 'Must be after the year start date'
        const od = Number(officeDays)
        const wd = Number(workingDays)
        const t = Number(target)
        if (officeDays === '' || isNaN(od) || od < 0)
            errs.officeDays = 'Enter a whole number ≥ 0'
        if (workingDays === '' || isNaN(wd) || wd <= 0)
            errs.workingDays = 'Enter a whole number > 0'
        if (!errs.officeDays && !errs.workingDays && od > wd)
            errs.officeDays = 'Office days cannot exceed working days'
        if (target === '' || isNaN(t) || t <= 0 || t > 100)
            errs.target = 'Enter a % between 1 and 100'
        return errs
    }

    function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }
        onSetup({
            yearStart,
            endDate: asOfDate,
            officeDays: Number(officeDays),
            workingDays: Number(workingDays),
            target: Number(target),
        })
    }

    return (
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-10 transition-colors duration-300"
            data-testid="setup-screen"
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🏢</div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        The 40% Club
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Enter your YTD attendance figures from your company dashboard to get started.
                    </p>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm space-y-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="Year start"
                            hint="Usually 1 Jan"
                            error={errors.yearStart}
                        >
                            <input
                                data-testid="setup-year-start"
                                type="date"
                                value={yearStart}
                                onChange={e => { setYearStart(e.target.value); setErrors(v => ({ ...v, yearStart: undefined })) }}
                                className={errors.yearStart ? inputErrCls : inputCls}
                            />
                        </Field>

                        <Field
                            label='"As of" date'
                            hint="Last date on dashboard"
                            error={errors.asOfDate}
                        >
                            <input
                                data-testid="setup-as-of-date"
                                type="date"
                                value={asOfDate}
                                onChange={e => { setAsOfDate(e.target.value); setErrors(v => ({ ...v, asOfDate: undefined })) }}
                                className={errors.asOfDate ? inputErrCls : inputCls}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="Office days"
                            hint="Days in office YTD"
                            error={errors.officeDays}
                        >
                            <input
                                data-testid="setup-office-days"
                                type="number"
                                min="0"
                                step="1"
                                value={officeDays}
                                onChange={e => { setOfficeDays(e.target.value); setErrors(v => ({ ...v, officeDays: undefined })) }}
                                placeholder="e.g. 34"
                                className={errors.officeDays ? inputErrCls : inputCls}
                            />
                        </Field>

                        <Field
                            label="Working days"
                            hint="Total working days YTD"
                            error={errors.workingDays}
                        >
                            <input
                                data-testid="setup-working-days"
                                type="number"
                                min="1"
                                step="1"
                                value={workingDays}
                                onChange={e => { setWorkingDays(e.target.value); setErrors(v => ({ ...v, workingDays: undefined })) }}
                                placeholder="e.g. 90"
                                className={errors.workingDays ? inputErrCls : inputCls}
                            />
                        </Field>
                    </div>

                    <Field
                        label="Attendance target (%)"
                        hint="Your company's required minimum"
                        error={errors.target}
                    >
                        <input
                            data-testid="setup-target"
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value={target}
                            onChange={e => { setTarget(e.target.value); setErrors(v => ({ ...v, target: undefined })) }}
                            placeholder="e.g. 40"
                            className={errors.target ? inputErrCls : inputCls}
                        />
                    </Field>

                    <div className="pt-1">
                        <button
                            data-testid="setup-submit"
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                        >
                            Get Started →
                        </button>
                    </div>
                </form>

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-5">
                    jimmymcmahoncoding™
                </p>
            </div>
        </div>
    )
}
