import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/BookingController';

interface Booking {
    id: number;
    status: string;
    payment_status: string;
    billing_type: string;
    amount_due: string;
    amount_paid: string;
    start_date: string;
    course: {
        title: string;
        subject: { name: string };
        tutor_profile: { full_name: string };
    };
    schedule: {
        day_of_week: string | null;
        specific_date: string | null;
        start_time: string;
        end_time: string;
        is_recurring: boolean;
    };
    sessions: { id: number; status: string; session_date: string }[];
}

interface Props {
    bookings: {
        data: Booking[];
        total: number;
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function BookingsIndex({ bookings }: Props) {
    return (
        <AppLayout>
            <Head title="My Bookings" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    My Bookings
                </h1>

                {bookings.data.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">No bookings yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.data.map((booking) => (
                            <Link
                                key={booking.id}
                                href={show.url(booking.id)}
                                className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {booking.course.title}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {booking.course.subject.name} · {booking.course.tutor_profile.full_name}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            {booking.schedule.is_recurring
                                                ? `${booking.schedule.day_of_week} · ${booking.schedule.start_time}–${booking.schedule.end_time}`
                                                : `${formatDate(booking.schedule.specific_date)} · ${booking.schedule.start_time}–${booking.schedule.end_time}`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[booking.status] ?? ''}`}>
                                            {booking.status}
                                        </span>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            LKR {Number(booking.amount_due).toLocaleString('en-LK')}
                                            <span className="ml-1 text-xs font-normal text-gray-500">
                                                /{booking.billing_type === 'monthly' ? 'mo' : 'session'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Upcoming sessions mini-list */}
                                {booking.sessions.filter((s) => s.status === 'scheduled').length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-700">
                                        {booking.sessions
                                            .filter((s) => s.status === 'scheduled')
                                            .slice(0, 4)
                                            .map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"
                                                >
                                                    {s.session_date}
                                                </span>
                                            ))}
                                        {booking.sessions.filter((s) => s.status === 'scheduled').length > 4 && (
                                            <span className="text-xs text-gray-400">
                                                +{booking.sessions.filter((s) => s.status === 'scheduled').length - 4} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-1">
                        {bookings.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
