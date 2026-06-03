import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {show as bookingsShow } from '@/actions/App/Http/Controllers/BookingController';

interface Props {
    payment: {
        order_id: string;
        status: string;
        amount: string;
        currency: string;
        booking_id: number;
    } | null;
}

export default function Cancel({ payment }: Props) {
    return (
        <AppLayout>
            <Head title="Payment Cancelled" />
            <div className="max-w-lg mx-auto py-16 px-4 text-center">
                <div className="size-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <span className="text-4xl">❌</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-500 mb-6">
                    You cancelled the payment. Your booking is still confirmed —
                    you can pay at any time.
                </p>

                {payment && (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 px-6 py-4 text-left space-y-2 text-sm mb-8">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono text-gray-700">{payment.order_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold text-gray-700">
                                {payment.currency} {Number(payment.amount).toLocaleString('en-LK', {
                                    minimumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {payment && (
                        <>
                            <Link
                                href={bookingsShow.url(payment.booking_id)}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                                           font-semibold px-6 py-3 transition-colors"
                            >
                                Return to Booking
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
