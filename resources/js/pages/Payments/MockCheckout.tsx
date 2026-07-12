import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { mockSuccess } from '@/actions/App/Http/Controllers/PaymentController';
import { mockFail } from '@/actions/App/Http/Controllers/PaymentController';

interface Props {
    checkoutData: {
        merchant_id: string;
        order_id: string;
        amount: string;
        currency: string;
        hash: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        items: string;
        return_url: string;
        cancel_url: string;
        notify_url: string;
    };
}

const PAYMENT_METHODS = [
    { id: 'VISA',   label: 'Visa Card',       icon: '💳' },
    { id: 'MASTER', label: 'Mastercard',       icon: '💳' },
    { id: 'EZCASH', label: 'EZCash',           icon: '📱' },
    { id: 'MCASH',  label: 'mCash',            icon: '📱' },
    { id: 'BANK',   label: 'Bank Transfer',    icon: '🏦' },
];

export default function MockCheckout({ checkoutData }: Props) {
    const [selectedMethod, setSelectedMethod] = useState('VISA');
    const [cardNumber, setCardNumber]         = useState('4111 1111 1111 1111');
    const [cardExpiry, setCardExpiry]         = useState('12/26');
    const [cardCvv, setCardCvv]               = useState('123');
    const [cardHolder, setCardHolder]         = useState(
        `${checkoutData.first_name} ${checkoutData.last_name}`
    );

    const successForm = useForm({
        order_id:         checkoutData.order_id,
        method:           selectedMethod,
        card_holder_name: cardHolder,
    });

    const failForm = useForm({
        order_id: checkoutData.order_id,
    });

    const handleSuccess = (e: React.FormEvent) => {
        e.preventDefault();
        successForm.setData('method', selectedMethod);
        successForm.setData('card_holder_name', cardHolder);
        successForm.post(mockSuccess.url());
    };

    const handleFail = (e: React.FormEvent) => {
        e.preventDefault();
        failForm.post(mockFail.url());
    };

    const isCardMethod = ['VISA', 'MASTER', 'AMEX'].includes(selectedMethod);

    return (
        <>
            <Head title="PayHere Mock Checkout" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">

                    {/* PayHere mock header */}
                    <div className="mb-4 rounded-xl bg-amber-100 border border-amber-300 px-4 py-2.5
                                    text-sm text-amber-900 text-center">
                        ⚠️ <strong>Mock PayHere Gateway</strong> — Simulated checkout for development
                    </div>

                    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
                        {/* PayHere branding bar */}
                        <div className="bg-[#1a5276] px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-xl tracking-wide">PayHere</p>
                                <p className="text-white/60 text-xs">Sandbox Environment</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/70 text-xs">Amount</p>
                                <p className="text-white font-bold text-lg">
                                    {checkoutData.currency}{' '}
                                    {Number(checkoutData.amount).toLocaleString('en-LK', {
                                        minimumFractionDigits: 2
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Order info */}
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                            <span className="font-medium">Order:</span> {checkoutData.order_id}
                            &nbsp;·&nbsp;
                            <span className="font-medium">For:</span> {checkoutData.items}
                        </div>

                        <div className="px-6 py-5">
                            {/* Payment method selector */}
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Payment Method
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                    {PAYMENT_METHODS.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setSelectedMethod(m.id)}
                                            className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs
                                                transition-all cursor-pointer
                                                ${selectedMethod === m.id
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="text-lg">{m.icon}</span>
                                            <span className="text-center leading-tight">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Card fields (conditionally shown) */}
                            {isCardMethod && (
                                <div className="mb-5 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Card Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            value={cardHolder}
                                            onChange={(e) => setCardHolder(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            maxLength={19}
                                            placeholder="4111 1111 1111 1111"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                                       font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Expiry (MM/YY)
                                            </label>
                                            <input
                                                type="text"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                maxLength={5}
                                                placeholder="12/26"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                                           font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                                            <input
                                                type="text"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                                maxLength={4}
                                                placeholder="123"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                                           font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">
                                        Use any test values — this is a sandbox simulation.
                                    </p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="space-y-2">
                                <form onSubmit={handleSuccess}>
                                    <button
                                        type="submit"
                                        disabled={successForm.processing}
                                        className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60
                                                   text-white font-semibold py-3 transition-colors"
                                    >
                                        {successForm.processing
                                            ? 'Processing...'
                                            : `✓ Simulate Successful Payment`}
                                    </button>
                                </form>
                                <form onSubmit={handleFail}>
                                    <button
                                        type="submit"
                                        disabled={failForm.processing}
                                        className="w-full rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-60
                                                   text-red-700 font-semibold py-3 transition-colors"
                                    >
                                        {failForm.processing ? 'Processing...' : '✗ Simulate Failed Payment'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
