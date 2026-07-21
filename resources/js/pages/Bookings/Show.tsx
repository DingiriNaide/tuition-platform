import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cancel, confirm, show } from '@/actions/App/Http/Controllers/BookingController';
import { bookingRoster } from '@/actions/App/Http/Controllers/AttendanceController';
import { create as createReport } from '@/actions/App/Http/Controllers/ProgressReportController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ProgressReportController';
import { initiate as paymentsInitiate } from '@/actions/App/Http/Controllers/PaymentController';
import { store as createLiveSession } from '@/actions/App/Http/Controllers/LiveSessionController';
import { show as showLiveSession } from '@/actions/App/Http/Controllers/LiveSessionController';
import { studentIndex } from '@/actions/App/Http/Controllers/AssignmentController';
import { store as storeReview } from '@/actions/App/Http/Controllers/TutorReviewController';
import { FileText, ClipboardCheck, ClipboardList, Video, CheckCircle2, XCircle, Star } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

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
        thumbnail_url: string | null;
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
    existingReview: { rating: number; comment: string | null } | null;
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

export default function BookingShow({ booking, dayOptions, existingReview }: Props) {
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

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [comment, setComment] = useState(existingReview?.comment ?? '');

    const [isConfirming, setIsConfirming]       = useState(false);
    const [isCancelling, setIsCancelling]       = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isStartingLive, setIsStartingLive]   = useState(false);

    function handleSubmitReview(): void {
        setIsSubmittingReview(true);
        router.post(
            storeReview.url(booking.id),
            { rating, comment },
            {
                onSuccess: () => setShowReviewModal(false),
                onFinish: () => setIsSubmittingReview(false),
            }
        );
    }

    function handleConfirm(): void {
        setIsConfirming(true);
        router.post(confirm.url(booking.id), {}, {
            onFinish: () => setIsConfirming(false),
        });
    }

    function handleCancel(): void {
        setIsCancelling(true);
        router.post(
            cancel.url(booking.id),
            { cancellation_reason: cancelReason },
            {
                onSuccess: () => setShowCancelModal(false),
                onFinish: () => setIsCancelling(false),
            },
        );
    }

    function handleStartLiveSession(): void {
        setIsStartingLive(true);
        router.post(createLiveSession.url(), { booking_id: booking.id }, {
            onFinish: () => setIsStartingLive(false),
        });
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
        <>
            <Head title={`Booking #${booking.id}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 relative">
                <LoadingOverlay show={isConfirming} message="Confirming booking…" variant="card" />
                <LoadingOverlay show={isCancelling} message="Cancelling booking…" variant="card" />
                <LoadingOverlay show={isStartingLive} message="Starting live session…" variant="card" />

                {/* ── Course Banner ── */}
                {booking.course.thumbnail_url && (
                    <div className="mb-6 overflow-hidden rounded-lg">
                        <img
                            src={booking.course.thumbnail_url}
                            alt={booking.course.title}
                            className="h-48 w-full object-cover sm:h-64"
                        />
                    </div>
                )}

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
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Confirm Booking
                                    </button>
                                )}

                                {isStudent && (
                                    <Link
                                        href={studentIndex.url(booking.id)}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View Assignments
                                    </Link>
                                )}

                                <Link
                                    href={bookingRoster.url(booking.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                                >
                                    <ClipboardCheck className="h-4 w-4" />
                                    View Attendance
                                </Link>

                                {isStudent && completedSessions.length > 0 && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                                    >
                                        <Star className="h-4 w-4" />
                                        {existingReview ? 'Edit Your Review' : 'Rate This Tutor'}
                                    </button>
                                )}

                                {isTutor && booking.status === 'confirmed' && (
                                    <button
                                        onClick={handleStartLiveSession}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        <Video className="h-4 w-4" />
                                        Start Live Session
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
                                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                                                >
                                                    <Video className="h-4 w-4" />
                                                    {s.live_session!.status === 'live' ? 'Join Live Session' : 'Session Starting Soon'}
                                                </Link>
                                            ))}
                                    </>
                                )}

                                {/* Progress report actions — tutor only */}
                                {isTutor && (
                                    <>
                                        <Link
                                            href={createReport.url(booking.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Write Progress Report
                                        </Link>
                                        <Link
                                            href={reportsIndex.url()}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            All My Reports
                                        </Link>
                                    </>
                                )}

                                {canCancel && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="h-4 w-4" />
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

            {/* ── Review modal ── */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
                        <LoadingOverlay show={isSubmittingReview} message="Submitting review…" variant="card" />
                        <h3 className="mb-1 text-lg font-semibold text-gray-900">Rate this course</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            How was {booking.course.title} with {booking.course.tutor_profile.full_name}?
                        </p>

                        <div className="mb-4 flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)}>
                                    <Star
                                        className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience (optional)"
                            rows={3}
                            className="mb-4 w-full rounded-xl border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </>
    );
}