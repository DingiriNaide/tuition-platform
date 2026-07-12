import { Head, useForm } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/BookingController';

interface ScheduleSlot {
    id: number;
    day_of_week: string | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recur_until: string | null;
    max_students: number;
    spots_taken: number;
    spots_left: number;
    is_full: boolean;
}

interface Course {
    id: number;
    title: string;
    price_per_session: string | null;
    price_monthly: string | null;
    subject: { name: string };
    tutor_profile: { full_name: string };
}

interface Props {
    course: Course;
    schedules: ScheduleSlot[];
    dayOptions: Record<string, string>;
}

interface BookingForm {
    course_id: string;
    schedule_id: string;
    billing_type: string;
    start_date: string;
    notes: string;
}

export default function BookingCreate({ course, schedules, dayOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm<BookingForm>({
        course_id:    String(course.id),
        schedule_id:  '',
        billing_type: course.price_monthly ? 'monthly' : 'per_session',
        start_date:   '',
        notes:        '',
    });

    function submit(e: React.FormEvent): void {
        e.preventDefault();
        post(store.url());
    }

    const selectedSchedule = schedules.find((s) => String(s.id) === data.schedule_id);

    return (
        <>
            <Head title={`Book — ${course.title}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    Book a Course
                </h1>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {course.title} · {course.subject.name} · {course.tutor_profile.full_name}
                </p>

                <form onSubmit={submit} className="space-y-6">

                    {/* Schedule selection */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                            Select a Schedule
                        </h2>

                        {schedules.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No available schedules for this course yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {schedules.map((slot) => (
                                    <label
                                        key={slot.id}
                                        className={[
                                            'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition',
                                            slot.is_full
                                                ? 'cursor-not-allowed border-gray-200 opacity-50 dark:border-gray-700'
                                                : data.schedule_id === String(slot.id)
                                                ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                                : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700',
                                        ].join(' ')}
                                    >
                                        <input
                                            type="radio"
                                            name="schedule_id"
                                            value={slot.id}
                                            disabled={slot.is_full}
                                            checked={data.schedule_id === String(slot.id)}
                                            onChange={() => setData('schedule_id', String(slot.id))}
                                            className="mt-0.5 text-indigo-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {slot.is_recurring
                                                    ? `Every ${dayOptions[slot.day_of_week ?? ''] ?? slot.day_of_week}`
                                                    : slot.specific_date}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {slot.start_time} – {slot.end_time}
                                                {slot.is_recurring && slot.recur_until
                                                    ? ` · until ${slot.recur_until}`
                                                    : ''}
                                            </p>
                                            <p className={`mt-1 text-xs font-medium ${slot.is_full ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                                {slot.is_full
                                                    ? 'Fully booked'
                                                    : `${slot.spots_left} spot${slot.spots_left !== 1 ? 's' : ''} left`}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        {errors.schedule_id && (
                            <p className="mt-2 text-xs text-red-500">{errors.schedule_id}</p>
                        )}
                    </div>

                    {/* Billing type */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                            Billing
                        </h2>
                        <div className="flex gap-4">
                            {([
                                { value: 'per_session', label: `Per session — LKR ${course.price_per_session ?? 'N/A'}`, disabled: !course.price_per_session },
                                { value: 'monthly', label: `Monthly — LKR ${course.price_monthly ?? 'N/A'}`, disabled: !course.price_monthly },
                            ] as const).map(({ value, label, disabled }) => (
                                <label
                                    key={value}
                                    className={`flex cursor-pointer items-center gap-2 text-sm ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="billing_type"
                                        value={value}
                                        disabled={disabled}
                                        checked={data.billing_type === value}
                                        onChange={() => setData('billing_type', value)}
                                        className="text-indigo-600"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                        {errors.billing_type && (
                            <p className="mt-2 text-xs text-red-500">{errors.billing_type}</p>
                        )}
                    </div>

                    {/* Start date + notes */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                            Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className={inp(!!errors.start_date)}
                                />
                                {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                                {selectedSchedule?.is_recurring && data.start_date && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Sessions will be generated for the first 4 weeks starting this date.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Notes for tutor (optional)
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className={inp(!!errors.notes)}
                                    placeholder="Any specific requirements, learning goals, etc."
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || schedules.length === 0}
                            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Submitting…' : 'Submit Booking Request'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function inp(err: boolean) {
    return `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`;
}
