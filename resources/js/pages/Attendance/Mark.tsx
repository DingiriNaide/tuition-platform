import { Head, useForm, Link } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/AttendanceController';
import { show as showBooking } from '@/actions/App/Http/Controllers/BookingController';

interface AttendanceRecord {
    status: string;
    minutes_late: number;
    tutor_notes: string | null;
}

interface Session {
    id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface Booking {
    id: number;
    student_profile: { full_name: string };
    course: { title: string; subject: { name: string } };
}

interface Props {
    session: Session;
    booking: Booking;
    existingRecord: AttendanceRecord | null;
    statusOptions: Record<string, string>;
}

interface AttendanceForm {
    status: string;
    minutes_late: string;
    tutor_notes: string;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AttendanceMark({
    session,
    booking,
    existingRecord,
    statusOptions,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<AttendanceForm>({
        status:       existingRecord?.status ?? 'present',
        minutes_late: String(existingRecord?.minutes_late ?? 0),
        tutor_notes:  existingRecord?.tutor_notes ?? '',
    });

    function submit(e: React.FormEvent): void {
        e.preventDefault();
        post(store.url(session.id));
    }

    const statusStyles: Record<string, string> = {
        present: 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20',
        absent:  'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20',
        late:    'border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20',
        excused: 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20',
    };

    const statusIconColors: Record<string, string> = {
        present: 'text-green-600 dark:text-green-400',
        absent:  'text-red-600 dark:text-red-400',
        late:    'text-yellow-600 dark:text-yellow-400',
        excused: 'text-blue-600 dark:text-blue-400',
    };

    return (
        <>
            <Head title="Mark Attendance" />

            <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <Link
                        href={showBooking.url(booking.id)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        Booking #{booking.id}
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">Mark Attendance</span>
                </nav>

                {/* Session info card */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Session
                    </p>
                    <h1 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {booking.course.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.course.subject.name}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <span>📅 {formatDate(session.session_date)}</span>
                        <span>🕐 {session.start_time} – {session.end_time}</span>
                        <span>👤 {booking.student_profile.full_name}</span>
                    </div>
                    {existingRecord && (
                        <p className="mt-3 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Updating existing record
                        </p>
                    )}
                </div>

                {/* Attendance form */}
                <form onSubmit={submit} className="space-y-5">

                    {/* Status selector — large tap targets */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attendance Status <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(statusOptions).map(([value, label]) => (
                                <label
                                    key={value}
                                    className={[
                                        'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition',
                                        data.status === value
                                            ? statusStyles[value]
                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
                                    ].join(' ')}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={value}
                                        checked={data.status === value}
                                        onChange={() => setData('status', value)}
                                        className="sr-only"
                                    />
                                    <span className={`text-2xl`}>
                                        {value === 'present' ? '✓' :
                                         value === 'absent'  ? '✗' :
                                         value === 'late'    ? '⏰' : '📋'}
                                    </span>
                                    <span className={`text-sm font-semibold ${
                                        data.status === value
                                            ? statusIconColors[value]
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.status && (
                            <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                        )}
                    </div>

                    {/* Minutes late — only shown when status = late */}
                    {data.status === 'late' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Minutes Late <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={data.minutes_late}
                                onChange={(e) => setData('minutes_late', e.target.value)}
                                className={inp(!!errors.minutes_late)}
                                placeholder="e.g. 15"
                            />
                            {errors.minutes_late && (
                                <p className="mt-1 text-xs text-red-500">{errors.minutes_late}</p>
                            )}
                        </div>
                    )}

                    {/* Tutor notes */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <textarea
                            value={data.tutor_notes}
                            onChange={(e) => setData('tutor_notes', e.target.value)}
                            rows={3}
                            className={inp(!!errors.tutor_notes)}
                            placeholder="Session observations, topics covered, etc."
                        />
                        {errors.tutor_notes && (
                            <p className="mt-1 text-xs text-red-500">{errors.tutor_notes}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link
                            href={showBooking.url(booking.id)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : existingRecord ? 'Update Attendance' : 'Mark Attendance'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function inp(err: boolean): string {
    return `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
        err
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
    }`;
}
