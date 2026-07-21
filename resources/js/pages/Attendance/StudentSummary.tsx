import { Head, Link, router } from '@inertiajs/react';
import { bookingRoster } from '@/actions/App/Http/Controllers/AttendanceController';
import EmptyState from '@/components/empty-state';
import { CheckSquare } from 'lucide-react';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';

interface AttendanceRecord {
    id: number;
    status: string;
    minutes_late: number;
    tutor_notes: string | null;
    marked_at: string | null;
    booking_session: {
        session_date: string;
        start_time: string;
        end_time: string;
    };
    booking: {
        id: number;
        course: {
            title: string;
            subject: { name: string };
            tutor_profile: { full_name: string };
        };
    };
}

interface CourseSummary {
    booking_id: number;
    total: number;
    attended: number;
    absent: number;
    late: number;
    excused: number;
    booking: {
        id: number;
        course: {
            title: string;
            subject: { name: string };
            tutor_profile: { full_name: string };
        };
    };
}

interface Props {
    records: {
        data: AttendanceRecord[];
        total: number;
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    courseSummary: CourseSummary[];
    statusOptions: Record<string, string>;
}

const statusBadge: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    excused: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function StudentAttendanceSummary({
    records,
    courseSummary,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="My Attendance" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    My Attendance
                </h1>

                {/* Per-course summary cards */}
                {courseSummary.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Course Overview
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {courseSummary.map((summary) => {
                                const rate = summary.total > 0
                                    ? Math.round(((summary.attended + summary.late) / summary.total) * 100)
                                    : 0;
                                const rateColor =
                                    rate >= 80 ? 'text-green-600 dark:text-green-400' :
                                    rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                 'text-red-600 dark:text-red-400';

                                return (
                                    <Link
                                        key={summary.booking_id}
                                        href={bookingRoster.url(summary.booking_id)}
                                        className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {summary.booking.course.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {summary.booking.course.subject.name} ·{' '}
                                            {summary.booking.course.tutor_profile.full_name}
                                        </p>
                                        <div className="mt-3">
                                            <div className="mb-1 flex justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Attendance Rate
                                                </span>
                                                <span className={`font-bold ${rateColor}`}>
                                                    {rate}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${rate}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="text-green-600 dark:text-green-400">
                                                ✓ {summary.attended} attended
                                            </span>
                                            <span className="text-red-600 dark:text-red-400">
                                                ✗ {summary.absent} absent
                                            </span>
                                            {summary.late > 0 && (
                                                <span className="text-yellow-600 dark:text-yellow-400">
                                                    ⏰ {summary.late} late
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent attendance records */}
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Recent Sessions ({records.total})
                </h2>

                {/* {records.data.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">
                            No attendance records yet.
                        </p>
                    </div> */}
                {records.data.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No attendance records yet."
                        description="You haven't attended any sessions yet."
                        action={{ label: 'Browse Courses', href: coursesIndex.url() }}
                    />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        {['Date', 'Course', 'Time', 'Status', 'Notes'].map((h) => (
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
                                    {records.data.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(record.booking_session.session_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {record.booking.course.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {record.booking.course.tutor_profile.full_name}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {record.booking_session.start_time} – {record.booking_session.end_time}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[record.status] ?? ''}`}>
                                                    {statusOptions[record.status] ?? record.status}
                                                    {record.status === 'late' && record.minutes_late > 0
                                                        ? ` (${record.minutes_late}m)`
                                                        : ''}
                                                </span>
                                            </td>
                                            <td className="max-w-[180px] px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                {record.tutor_notes ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {records.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-1">
                                {records.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
