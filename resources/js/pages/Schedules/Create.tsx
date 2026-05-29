import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/ScheduleController';
import { FormEvent } from 'react';

interface Course {
    id: number;
    title: string;
    subject: { name: string };
    max_students: number;
}

interface Props {
    courses: Course[];
    dayOptions: Record<string, string>;
}

interface ScheduleForm {
    course_id: string;
    is_recurring: boolean;
    day_of_week: string;
    specific_date: string;
    start_time: string;
    end_time: string;
    recur_until: string;
    max_students: string;
    is_active: boolean;
}

export default function ScheduleCreate({ courses, dayOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm<ScheduleForm>({
        course_id:     '',
        is_recurring:  true,
        day_of_week:   '',
        specific_date: '',
        start_time:    '',
        end_time:      '',
        recur_until:   '',
        max_students:  '',
        is_active:     true,
    });

    function submit(e: FormEvent): void {
        e.preventDefault();
        post(store.url());
    }

    return (
        <AppLayout>
            <Head title="Add Schedule" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    Add Availability Schedule
                </h1>

                <form onSubmit={submit} className="space-y-6">
                    <Card title="Schedule Details">

                        {/* Course */}
                        <Field label="Course" error={errors.course_id} required>
                            <select
                                value={data.course_id}
                                onChange={(e) => setData('course_id', e.target.value)}
                                className={sel(!!errors.course_id)}
                            >
                                <option value="">Select a course</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} — {c.subject.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Recurring toggle */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Schedule Type
                            </label>
                            <div className="flex gap-4">
                                {[
                                    { value: true, label: 'Weekly recurring' },
                                    { value: false, label: 'One-off date' },
                                ].map(({ value, label }) => (
                                    <label
                                        key={String(value)}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="radio"
                                            checked={data.is_recurring === value}
                                            onChange={() => setData('is_recurring', value)}
                                            className="text-indigo-600"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Conditional: Day of week or specific date */}
                        {data.is_recurring ? (
                            <>
                                <Field label="Day of Week" error={errors.day_of_week} required>
                                    <select
                                        value={data.day_of_week}
                                        onChange={(e) => setData('day_of_week', e.target.value)}
                                        className={sel(!!errors.day_of_week)}
                                    >
                                        <option value="">Select day</option>
                                        {Object.entries(dayOptions).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Repeat Until (optional)" error={errors.recur_until}>
                                    <input
                                        type="date"
                                        value={data.recur_until}
                                        onChange={(e) => setData('recur_until', e.target.value)}
                                        className={inp(!!errors.recur_until)}
                                    />
                                </Field>
                            </>
                        ) : (
                            <Field label="Date" error={errors.specific_date} required>
                                <input
                                    type="date"
                                    value={data.specific_date}
                                    onChange={(e) => setData('specific_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={inp(!!errors.specific_date)}
                                />
                            </Field>
                        )}

                        {/* Times */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Start Time" error={errors.start_time} required>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className={inp(!!errors.start_time)}
                                />
                            </Field>
                            <Field label="End Time" error={errors.end_time} required>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className={inp(!!errors.end_time)}
                                />
                            </Field>
                        </div>

                        {/* Max students override */}
                        <Field
                            label="Max Students (leave blank to use course default)"
                            error={errors.max_students}
                        >
                            <input
                                type="number"
                                min="1"
                                max="500"
                                value={data.max_students}
                                onChange={(e) => setData('max_students', e.target.value)}
                                className={inp(!!errors.max_students)}
                                placeholder="Course default"
                            />
                        </Field>

                        {/* Active */}
                        <div className="flex items-center gap-3">
                            <Toggle
                                checked={data.is_active}
                                onChange={(v) => setData('is_active', v)}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {data.is_active ? 'Active (students can book)' : 'Inactive (hidden from booking)'}
                            </span>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

// ── Utilities ─────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label, error, required, children,
}: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
        </label>
    );
}

function inp(err: boolean) {
    return `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`;
}

function sel(err: boolean) { return inp(err); }
