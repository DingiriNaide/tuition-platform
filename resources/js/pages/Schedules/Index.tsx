import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    create,
    edit,
    destroy,
} from '@/actions/App/Http/Controllers/ScheduleController';

interface Course {
    id: number;
    title: string;
    subject: { name: string };
}

interface Schedule {
    id: number;
    course: Course;
    day_of_week: string | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recur_until: string | null;
    max_students: number | null;
    is_active: boolean;
}

interface Props {
    schedules: Schedule[];
    dayOptions: Record<string, string>;
}

export default function SchedulesIndex({ schedules, dayOptions }: Props) {
    function handleDelete(schedule: Schedule): void {
        if (!confirm(`Delete this schedule? Active bookings will block deletion.`)) return;
        router.delete(destroy.url(schedule.id));
    }

    const active   = schedules.filter((s) => s.is_active);
    const inactive = schedules.filter((s) => !s.is_active);

    return (
        <AppLayout>
            <Head title="My Schedules" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Schedules
                    </h1>
                    <Link
                        href={create.url()}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        + Add Schedule
                    </Link>
                </div>

                {schedules.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-8">
                        {active.length > 0 && (
                            <ScheduleGroup
                                title="Active Schedules"
                                schedules={active}
                                dayOptions={dayOptions}
                                onDelete={handleDelete}
                            />
                        )}
                        {inactive.length > 0 && (
                            <ScheduleGroup
                                title="Inactive Schedules"
                                schedules={inactive}
                                dayOptions={dayOptions}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ScheduleGroup({
    title,
    schedules,
    dayOptions,
    onDelete,
}: {
    title: string;
    schedules: Schedule[];
    dayOptions: Record<string, string>;
    onDelete: (s: Schedule) => void;
}) {
    return (
        <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {title}
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            {['Course', 'Day / Date', 'Time', 'Students', 'Status', ''].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {schedules.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {s.course.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {s.course.subject.name}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {s.is_recurring
                                        ? dayOptions[s.day_of_week ?? ''] ?? s.day_of_week
                                        : s.specific_date}
                                    {s.is_recurring && s.recur_until && (
                                        <p className="text-xs text-gray-400">
                                            until {s.recur_until}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {s.start_time} – {s.end_time}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {s.max_students ?? 'Course default'}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            s.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                    >
                                        {s.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={edit.url(s.id)}
                                            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => onDelete(s)}
                                            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
                No schedules yet. Add your first availability slot.
            </p>
            <Link
                href={create.url()}
                className="mt-3 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
                Add schedule →
            </Link>
        </div>
    );
}
