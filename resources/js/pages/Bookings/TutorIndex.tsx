import { Head, Link, router } from '@inertiajs/react';
import { show, confirm } from '@/actions/App/Http/Controllers/BookingController';
import EmptyState from '@/components/empty-state';
import { CalendarDays } from 'lucide-react';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';

interface Booking {
    id: number;
    status: string;
    billing_type: string;
    amount_due: string;
    start_date: string;
    course: { title: string; subject: { name: string } };
    schedule: {
        day_of_week: string | null;
        start_time: string;
        end_time: string;
        is_recurring: boolean;
        specific_date: string | null;
    };
    student_profile: { full_name: string };
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

const statusBadge: Record<string, string> = {
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

export default function TutorBookingsIndex({ bookings }: Props) {
    function handleConfirm(id: number): void {
        router.post(confirm.url(id));
    }

    return (
        <>
            <Head title="Student Bookings" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    Student Bookings
                </h1>

                {bookings.data.length === 0 ? (
                    <EmptyState
                        icon={CalendarDays}
                        title="No bookings yet"
                        description="No students have booked a session for this course. Once a student books a session, it will appear here."
                        action={{ label: 'Browse Courses', href: coursesIndex.url() }}
                    />
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {['Student', 'Course', 'Schedule', 'Amount', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {bookings.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {b.student_profile.full_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900 dark:text-white">{b.course.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{b.course.subject.name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {b.schedule.is_recurring
                                                ? `${b.schedule.day_of_week} ${b.schedule.start_time}–${b.schedule.end_time}`
                                                : `${formatDate(b.schedule.specific_date)} ${b.schedule.start_time}–${b.schedule.end_time}`}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                            LKR {Number(b.amount_due).toLocaleString('en-LK')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadge[b.status] ?? ''}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={show.url(b.id)}
                                                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                                >
                                                    View
                                                </Link>
                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirm(b.id)}
                                                        className="text-xs font-medium text-green-600 hover:underline dark:text-green-400"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
        </>
    );
}
