import AppLayout from '@/layouts/app-layout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cancel, confirm, show } from '@/actions/App/Http/Controllers/BookingController';
import { bookingRoster } from '@/actions/App/Http/Controllers/AttendanceController';
import { create as createReport } from '@/actions/App/Http/Controllers/ProgressReportController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ProgressReportController';
import { initiate as paymentsInitiate } from '@/actions/App/Http/Controllers/PaymentController';
import { store as createLiveSession } from '@/actions/App/Http/Controllers/LiveSessionController';
import { show as showLiveSession } from '@/actions/App/Http/Controllers/LiveSessionController';

interface Session {
    id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    student_attended: boolean;
    tutor_notes: string | null;
    live_session: { id: number; status: string } | null;
}

interface Booking {
    id: number;
    status: string;
    payment_status: string;
    billing_type: string;
    amount_due: string;
    amount_paid: string;
    start_date: string;
    end_date: string | null;
    notes: string | null;
    cancellation_reason: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    course: {
        id: number;
        title: string;
        subject: { name: string };
        tutor_profile: { full_name: string; user_id: number };
    };
    schedule: {
        day_of_week: string | null;
        specific_date: string | null;
        start_time: string;
        end_time: string;
        is_recurring: boolean;
        recur_until: string | null;
    };
    student_profile: { full_name: string; user_id: number };
    sessions: Session[];
}

interface Props {
    booking: Booking;
    dayOptions: Record<string, string>;
}

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scheduled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    ongoing:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    no_show:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function BookingShow({ booking, dayOptions }: Props) {
    const { auth } = usePage<{
        auth: { user: { id: number; roles: string[] } };
    }>().props;

    const isStudent   = auth.user.id === booking.student_profile.user_id;
    const isTutor     = auth.user.id === booking.course.tutor_profile.user_id;
    const isAdmin     = auth.user.roles?.some((r) => ['admin', 'super-admin'].includes(r));

    const canCancel   = isStudent && ['pending', 'confirmed'].includes(booking.status);
    const canConfirm  = isTutor && booking.status === 'pending';

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    function handleConfirm(): void {
        router.post(confirm.url(booking.id));
    }

    function handleCancel(): void {
        router.post(
            cancel.url(booking.id),
            { cancellation_reason: cancelReason },
            { onSuccess: () => setShowCancelModal(false) },
        );
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    const upcomingSessions  = booking.sessions.filter((s) => s.status === 'scheduled');
    const completedSessions = booking.sessions.filter((s) => s.status === 'completed');
    const cancelledSessions = booking.sessions.filter((s) => s.status === 'cancelled');

    return (
        <AppLayout>
            <Head title={`Booking #${booking.id}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {booking.course.title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Booking #{booking.id} · {booking.course.subject.name}
                            </p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusColors[booking.status] ?? ''}`}>
                            {booking.status}
                        </span>
                    </div>

                    {/* ── Payment Status Banners ── */}
                    {auth.user.roles.includes('student') && booking.status === 'confirmed' && booking.payment_status !== 'paid' && (
                        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-blue-900">Payment Required</p>
                                    <p className="text-sm text-blue-700">
                                        Amount Due: LKR {Number(booking.amount_due - booking.amount_paid).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <Link
                                    href={paymentsInitiate.url(booking.id)}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
                                >
                                    Pay with PayHere →
                                </Link>
                            </div>
                        </div>
                    )}

                    {auth.user.roles.includes('student') && booking.payment_status === 'paid' && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-green-800">
                            <span className="text-lg">✅</span>
                            <span className="font-semibold">Paid — No outstanding balance</span>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── Main ── */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Session list */}
                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Sessions ({booking.sessions.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {booking.sessions.length === 0 ? (
                                    <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
                                        No sessions generated yet.
                                    </p>
                                ) : (
                                    booking.sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDate(session.session_date)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {session.start_time} – {session.end_time}
                                                </p>
                                                {session.tutor_notes && (
                                                    <p className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">
                                                        {session.tutor_notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {session.status === 'completed' && session.student_attended && (
                                                    <span className="text-xs text-green-600 dark:text-green-400">✓ Attended</span>
                                                )}
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[session.status] ?? ''}`}>
                                                    {session.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Notes */}
                        {booking.notes && (
                            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Student Notes</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{booking.notes}</p>
                            </section>
                        )}

                        {/* Cancellation reason */}
                        {booking.cancellation_reason && (
                            <section className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
                                <h2 className="mb-2 font-semibold text-red-700 dark:text-red-400">Cancellation Reason</h2>
                                <p className="text-sm text-red-600 dark:text-red-300">{booking.cancellation_reason}</p>
                            </section>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4">

                        {/* Booking details */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Booking Details</h2>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Tutor</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                        {booking.course.tutor_profile.full_name}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Student</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                        {booking.student_profile.full_name}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Schedule</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                        {booking.schedule.is_recurring
                                            ? `${dayOptions[booking.schedule.day_of_week ?? ''] ?? booking.schedule.day_of_week}`
                                            : formatDate(booking.schedule.specific_date ?? '')}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Time</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                        {booking.schedule.start_time} – {booking.schedule.end_time}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Start Date</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{formatDate(booking.start_date)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Billing</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white capitalize">
                                        {booking.billing_type.replace('_', ' ')}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Payment */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Payment</h2>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Amount Due</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        LKR {Number(booking.amount_due).toLocaleString('en-LK')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        LKR {Number(booking.amount_paid).toLocaleString('en-LK')}
                                    </span>
                                </div>
                                {Number(booking.amount_due) > Number(booking.amount_paid) && (
                                    <div className="flex justify-between border-t border-gray-100 pt-1 dark:border-gray-700">
                                        <span className="text-red-500">Balance Due</span>
                                        <span className="font-semibold text-red-500">
                                            LKR {(Number(booking.amount_due) - Number(booking.amount_paid)).toLocaleString('en-LK')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[booking.payment_status] ?? ''}`}>
                                {booking.payment_status}
                            </span>
                        </div>

                        {/* Actions */}
                        {(canConfirm || canCancel || isTutor || isAdmin) && (
                            <div className="space-y-2">
                                {canConfirm && (
                                    <button
                                        onClick={handleConfirm}
                                        className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                                    >
                                        Confirm Booking
                                    </button>
                                )}

                                {/* Attendance roster — visible to tutor and student */}
                                <Link
                                    href={bookingRoster.url(booking.id)}
                                    className="block w-full rounded-md border border-indigo-300 px-4 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                >
                                    View Attendance
                                </Link>

                                {isTutor && booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => {
                                            router.post(createLiveSession.url(), {
                                                booking_id: booking.id,
                                            });
                                        }}
                                        className="block w-full rounded-md bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-500"
                                    >
                                        ▶ Start Live Session
                                    </button>
                                )}

                                {isStudent && (
                                    <>
                                        {booking.sessions
                                            .filter(s => s.live_session && ['waiting', 'live'].includes(s.live_session.status))
                                            .slice(0, 1)
                                            .map(s => (
                                                <Link
                                                    key={s.id}
                                                    href={showLiveSession.url(s.live_session!.id)}
                                                    className="block w-full rounded-md bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-500"
                                                >
                                                    {s.live_session!.status === 'live' ? '▶ Join Live Session' : '⏳ Session Starting Soon'}
                                                </Link>
                                            ))}
                                    </>
                                )}

                                {/* Progress report actions — tutor only */}
                                {isTutor && (
                                    <>
                                        <Link
                                            href={createReport.url(booking.id)}
                                            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Write Progress Report
                                        </Link>
                                        <Link
                                            href={reportsIndex.url()}
                                            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            All My Reports
                                        </Link>
                                    </>
                                )}

                                {canCancel && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: 'Upcoming', count: upcomingSessions.length, color: 'text-indigo-600 dark:text-indigo-400' },
                                { label: 'Done', count: completedSessions.length, color: 'text-green-600 dark:text-green-400' },
                                { label: 'Cancelled', count: cancelledSessions.length, color: 'text-red-600 dark:text-red-400' },
                            ].map(({ label, count, color }) => (
                                <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                    <p className={`text-lg font-bold ${color}`}>{count}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Cancel modal ── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                            Cancel Booking
                        </h3>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            This will cancel all upcoming sessions. This action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancel}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}