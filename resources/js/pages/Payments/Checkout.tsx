import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { mockCheckout } from '@/actions/App/Http/Controllers/PaymentController';

interface Props {
    booking: {
        id: number;
        course_title: string;
        subject_name: string;
        billing_type: string;
        amount_due: string;
        payment_status: string;
    };
    payment: {
        id: number;
        order_id: string;
        amount: string;
        currency: string;
        status: string;
    };
    payhere: {
        merchant_id: string;
        hash: string;
        notify_url: string;
        return_url: string;
        cancel_url: string;
        sandbox: boolean;
        checkout_url: string;
    };
    student: {
        full_name: string;
        phone: string;
        email: string;
    };
}

export default function Checkout({ booking, payment, payhere, student }: Props) {
    const nameParts  = student.full_name.split(' ');
    const firstName  = nameParts[0] ?? '';
    const lastName   = nameParts.slice(1).join(' ') || '-';

    const { post, processing } = useForm({
        merchant_id:  payhere.merchant_id,
        order_id:     payment.order_id,
        amount:       payment.amount,
        currency:     payment.currency,
        hash:         payhere.hash,
        first_name:   firstName,
        last_name:    lastName,
        email:        student.email,
        phone:        student.phone,
        address:      'Sri Lanka',
        city:         'Colombo',
        country:      'Sri Lanka',
        items:        `${booking.course_title} — ${booking.billing_type}`,
        return_url:   payhere.return_url,
        cancel_url:   payhere.cancel_url,
        notify_url:   payhere.notify_url,
    });

    const handleProceed = (e: React.FormEvent) => {
        e.preventDefault();
        // In sandbox/mock mode: redirect to our own mock checkout page
        // In live mode: submit to payhere.checkout_url instead
        post(mockCheckout.url());
    };

    return (
        <AppLayout>
            <Head title="Complete Payment" />
            <div className="max-w-2xl mx-auto py-10 px-4">

                {/* PayHere sandbox badge */}
                {payhere.sandbox && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 text-sm text-amber-800">
                        <span className="font-semibold">SANDBOX MODE</span>
                        <span>— No real money will be charged.</span>
                    </div>
                )}

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white/80 text-xs uppercase tracking-wider">Secure Payment via</p>
                                <p className="text-white font-bold text-lg">PayHere</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Order Summary
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Course</span>
                                <span className="font-medium text-gray-900 text-right max-w-[60%]">
                                    {booking.course_title}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subject</span>
                                <span className="font-medium text-gray-900">{booking.subject_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Billing</span>
                                <span className="font-medium text-gray-900 capitalize">
                                    {booking.billing_type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Order ID</span>
                                <span className="font-mono text-xs text-gray-500">{payment.order_id}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-baseline">
                            <span className="text-gray-700 font-medium">Total Due</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {payment.currency} {Number(payment.amount).toLocaleString('en-LK', {
                                    minimumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Billing Details
                        </h2>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Name</span>
                                <p className="font-medium text-gray-800">{student.full_name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Email</span>
                                <p className="font-medium text-gray-800">{student.email}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Phone</span>
                                <p className="font-medium text-gray-800">{student.phone}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Country</span>
                                <p className="font-medium text-gray-800">Sri Lanka</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="px-6 py-5">
                        <form onSubmit={handleProceed}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                                           text-white font-semibold py-3.5 text-base transition-colors
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {processing ? 'Redirecting...' : `Pay LKR ${Number(payment.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
                            </button>
                        </form>
                        <p className="mt-3 text-center text-xs text-gray-400">
                            🔒 Secured by PayHere — Sri Lanka's trusted payment gateway
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
