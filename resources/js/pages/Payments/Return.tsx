import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { show as bookingsShow } from '@/actions/App/Http/Controllers/BookingController';
import { index as paymentsIndex } from '@/actions/App/Http/Controllers/PaymentController';

interface Props {
    payment: {
        order_id: string;
        status: string;
        amount: string;
        currency: string;
        paid_at: string | null;
        booking_id: number;
    } | null;
}

export default function Return({ payment }: Props) {
    const isSuccess = payment?.status === 'completed';

    return (
        <AppLayout>
            <Head title={isSuccess ? 'Payment Successful' : 'Payment Processing'} />
            <div className="max-w-lg mx-auto py-16 px-4 text-center">
                <div className={`size-20 mx-auto rounded-full flex items-center justify-center mb-6
                    ${isSuccess ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {isSuccess
                        ? <span className="text-4xl">✅</span>
                        : <span className="text-4xl">⏳</span>
                    }
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isSuccess ? 'Payment Successful!' : 'Payment Being Processed'}
                </h1>

                {payment && (
                    <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 px-6 py-4 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono text-gray-700">{payment.order_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold text-gray-900">
                                {payment.currency} {Number(payment.amount).toLocaleString('en-LK', {
                                    minimumFractionDigits: 2
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-semibold capitalize
                                ${isSuccess ? 'text-green-600' : 'text-yellow-600'}`}>
                                {payment.status}
                            </span>
                        </div>
                        {payment.paid_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid At</span>
                                <span className="text-gray-700">
                                    {new Date(payment.paid_at).toLocaleString('en-LK', {
                                        timeZone: 'Asia/Colombo',
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    {payment && (
                        <Link
                            href={bookingsShow.url(payment.booking_id)}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                                       font-semibold px-6 py-3 transition-colors"
                        >
                            View Booking
                        </Link>
                    )}
                    <Link
                        href={paymentsIndex.url()}
                        className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700
                                   font-semibold px-6 py-3 transition-colors"
                    >
                        Payment History
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
