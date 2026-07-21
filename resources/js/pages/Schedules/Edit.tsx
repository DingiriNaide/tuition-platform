import { Head, useForm } from '@inertiajs/react';
import { update } from '@/actions/App/Http/Controllers/ScheduleController';
import { index } from '@/actions/App/Http/Controllers/ScheduleController';
import { Link } from '@inertiajs/react';

interface Course {
    id: number;
    title: string;
    subject: { name: string };
    max_students: number;
}

interface ScheduleData {
    id: number;
    course_id: number;
    is_recurring: boolean;
    day_of_week: string | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    recur_until: string | null;
    max_students: number | null;
    is_active: boolean;
}

interface Props {
    schedule: ScheduleData;
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

export default function ScheduleEdit({ schedule, courses, dayOptions }: Props) {
    const { data, setData, put, processing, errors } = useForm<ScheduleForm>({
        course_id:     String(schedule.course_id),
        is_recurring:  schedule.is_recurring,
        day_of_week:   schedule.day_of_week ?? '',
        specific_date: schedule.specific_date ?? '',
        start_time:    schedule.start_time,
        end_time:      schedule.end_time,
        recur_until:   schedule.recur_until ?? '',
        max_students:  schedule.max_students ? String(schedule.max_students) : '',
        is_active:     schedule.is_active,
    });

    function submit(e: React.FormEvent): void {
        e.preventDefault();
        put(update.url(schedule.id));
    }

    return (
        <>
            <Head title="Edit Schedule" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Schedule</h1>
                    <Link
                        href={index.url()}
                        className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                        ← Back to schedules
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="space-y-4">

                            {/* Course */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Course <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className={inp(!!errors.course_id)}
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} — {c.subject.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id}</p>}
                            </div>

                            {/* Recurring type */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Schedule Type
                                </label>
                                <div className="flex gap-4">
                                    {[{ value: true, label: 'Weekly recurring' }, { value: false, label: 'One-off date' }].map(({ value, label }) => (
                                        <label key={String(value)} className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                checked={data.is_recurring === value}
                                                onChange={() => setData('is_recurring', value)}
                                                className="text-emerald-600"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {data.is_recurring ? (
                                <>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Day of Week <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.day_of_week}
                                            onChange={(e) => setData('day_of_week', e.target.value)}
                                            className={inp(!!errors.day_of_week)}
                                        >
                                            <option value="">Select day</option>
                                            {Object.entries(dayOptions).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                        {errors.day_of_week && <p className="mt-1 text-xs text-red-500">{errors.day_of_week}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Repeat Until
                                        </label>
                                        <input
                                            type="date"
                                            value={data.recur_until}
                                            onChange={(e) => setData('recur_until', e.target.value)}
                                            className={inp(!!errors.recur_until)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.specific_date}
                                        onChange={(e) => setData('specific_date', e.target.value)}
                                        className={inp(!!errors.specific_date)}
                                    />
                                    {errors.specific_date && <p className="mt-1 text-xs text-red-500">{errors.specific_date}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className={inp(!!errors.start_time)}
                                    />
                                    {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className={inp(!!errors.end_time)}
                                    />
                                    {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Max Students Override
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.max_students}
                                    onChange={(e) => setData('max_students', e.target.value)}
                                    className={inp(!!errors.max_students)}
                                    placeholder="Course default"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
                                </label>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {data.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function inp(err: boolean) {
    return `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`;
}
