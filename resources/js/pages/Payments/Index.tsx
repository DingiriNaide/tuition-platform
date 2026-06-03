import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { show as bookingsShow } from '@/actions/App/Http/Controllers/BookingController';
import { initiate as paymentsInitiate } from '@/actions/App/Http/Controllers/PaymentController';

interface Payment {
    id: number;
    payhere_order_id: string | null;
    payhere_payment_id: string | null;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    method: string | null;
    paid_at: string | null;
    booking_id: number;
    booking: {
        id: number;
        course: {
            title: string;
            subject: { name: string };
        };
    };
}

interface PaginatedPayments {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    payments: PaginatedPayments;
}

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    failed:    'bg-red-100 text-red-700',
    refunded:  'bg-gray-100 text-gray-600',
};

const METHOD_LABELS: Record<string, string> = {
    card:          '💳 Card',
    bank_transfer: '🏦 Bank Transfer',
    ezcash:        '📱 EZCash',
    mcash:         '📱 mCash',
    other:         '💰 Other',
};

export default function Index({ payments }: Props) {
    return (
        <AppLayout>
            <Head title="Payment History" />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h1>

                {payments.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white
                                    px-6 py-16 text-center text-gray-400">
                        No payments found.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.data.map((payment) => (
                            <div
                                key={payment.id}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-4
                                           flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                            text-xs font-semibold ${STATUS_STYLES[payment.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                        {payment.method && (
                                            <span className="text-xs text-gray-500">
                                                {METHOD_LABELS[payment.method] ?? payment.method}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-medium text-gray-900 truncate">
                                        {payment.booking.course.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {payment.booking.course.subject.name}
                                    </p>
                                    {payment.payhere_order_id && (
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                            {payment.payhere_order_id}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <p className="text-lg font-bold text-gray-900">
                                        {payment.currency}{' '}
                                        {Number(payment.amount).toLocaleString('en-LK', {
                                            minimumFractionDigits: 2
                                        })}
                                    </p>
                                    {payment.paid_at && (
                                        <p className="text-xs text-gray-400">
                                            {new Date(payment.paid_at).toLocaleString('en-LK', {
                                                timeZone: 'Asia/Colombo',
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <Link
                                            href={bookingsShow.url(payment.booking_id)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            View Booking
                                        </Link>
                                        {payment.status === 'pending' && (
                                            <Link
                                                href={paymentsInitiate.url(payment.booking_id)}
                                                className="text-xs text-green-600 hover:underline font-semibold"
                                            >
                                                Pay Now
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {payments.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {payments.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                                        ${link.active
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-100
                                               text-gray-300 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
