import { Head, Link } from '@inertiajs/react';
import { show as showBooking } from '@/actions/App/Http/Controllers/BookingController';
import { mark } from '@/actions/App/Http/Controllers/AttendanceController';

interface AttendanceRecord {
    status: string;
    minutes_late: number;
    tutor_notes: string | null;
    marked_at: string | null;
}

interface Session {
    id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    student_attended: boolean;
    attendance_record: AttendanceRecord | null;
}

interface Booking {
    id: number;
    course: {
        title: string;
        subject: { name: string };
        tutor_profile: { full_name: string };
    };
    student_profile: { full_name: string };
    sessions: Session[];
}

interface Stats {
    total_sessions: number;
    completed: number;
    attended: number;
    absent: number;
    late: number;
    attendance_rate: number;
}

interface Props {
    booking: Booking;
    isTutorOwner: boolean;
    stats: Stats;
    statusOptions: Record<string, string>;
}

const statusBadge: Record<string, string> = {
    present:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    excused:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scheduled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function BookingRoster({
    booking,
    isTutorOwner,
    stats,
    statusOptions,
}: Props) {
    const attendanceRate = stats.attendance_rate;
    const rateColor =
        attendanceRate >= 80 ? 'text-green-600 dark:text-green-400' :
        attendanceRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                               'text-red-600 dark:text-red-400';

    return (
        <>
            <Head title={`Attendance — ${booking.course.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <Link
                        href={showBooking.url(booking.id)}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                        Booking #{booking.id}
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">Attendance Report</span>
                </nav>

                <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Attendance Report
                </h1>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {booking.course.title} · {booking.student_profile.full_name}
                </p>

                {/* Stats row */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        { label: 'Total Sessions', value: stats.total_sessions, color: 'text-gray-900 dark:text-white' },
                        { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Attended', value: stats.attended, color: 'text-green-600 dark:text-green-400' },
                        { label: 'Absent', value: stats.absent, color: 'text-red-600 dark:text-red-400' },
                        { label: 'Late', value: stats.late, color: 'text-yellow-600 dark:text-yellow-400' },
                    ].map(({ label, value, color }) => (
                        <div
                            key={label}
                            className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Attendance rate bar */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attendance Rate
                        </span>
                        <span className={`text-lg font-bold ${rateColor}`}>
                            {attendanceRate}%
                        </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className={`h-3 rounded-full transition-all ${
                                attendanceRate >= 80 ? 'bg-green-500' :
                                attendanceRate >= 60 ? 'bg-yellow-500' :
                                                      'bg-red-500'
                            }`}
                            style={{ width: `${attendanceRate}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Based on {stats.completed} completed session{stats.completed !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Session table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {['Date', 'Time', 'Session Status', 'Attendance', 'Notes', isTutorOwner ? 'Action' : ''].map((h) => (
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
                            {booking.sessions.map((session) => (
                                <tr
                                    key={session.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(session.session_date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                        {session.start_time} – {session.end_time}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadge[session.status] ?? ''}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {session.attendance_record ? (
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadge[session.attendance_record.status] ?? ''}`}>
                                                {statusOptions[session.attendance_record.status] ?? session.attendance_record.status}
                                                {session.attendance_record.status === 'late' && session.attendance_record.minutes_late > 0
                                                    ? ` (${session.attendance_record.minutes_late}m)`
                                                    : ''}
                                            </span>
                                        ) : session.status === 'scheduled' ? (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Not yet</span>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </td>
                                    <td className="max-w-[200px] px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                        {session.attendance_record?.tutor_notes ?? '—'}
                                    </td>
                                    {isTutorOwner && (
                                        <td className="px-4 py-3">
                                            {['scheduled', 'ongoing', 'completed'].includes(session.status) && (
                                                <Link
                                                    href={mark.url(session.id)}
                                                    className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                                                >
                                                    {session.attendance_record ? 'Edit' : 'Mark'}
                                                </Link>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
