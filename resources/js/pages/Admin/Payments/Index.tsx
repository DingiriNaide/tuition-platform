import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/components/empty-state';
import { refund } from '@/actions/App/Http/Controllers/PaymentController';
import { CreditCard, RotateCcw, Search } from 'lucide-react';

interface Payment {
    id: number;
    payhere_order_id: string;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    method: string | null;
    discount_amount: string;
    paid_at: string | null;
    created_at: string;
    student_profile: { full_name: string };
    booking: {
        id: number;
        billing_type: string;
        course: {
            title: string;
            tutor_profile: { full_name: string };
        };
    };
    voucher: { code: string } | null;
}

interface Props {
    payments: {
        data: Payment[];
        total: number;
        current_page: number;
        last_page: number;
    };
    summary: {
        total_completed: string;
        total_refunded: string;
        pending_count: number;
    };
    filters: {
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

const statusColors: Record<Payment['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminPaymentsIndex({ payments, summary, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

    const applyFilters = (overrides: Partial<typeof filters> = {}) => {
        router.get(
            '/admin/payments',
            { ...filters, search, status, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    const confirmRefund = () => {
        if (!refundTarget) return;
        router.post(refund.url(refundTarget.id), {
            onSuccess: () => {
                toast.success('Payment refunded');
                setRefundTarget(null);
            },
            onError: () => toast.error('Refund failed'),
        });
    };

    return (
        <>
            <Head title="Payments — Admin" />

            <div className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold text-gray-900">Payments</h1>

                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Total collected</p>
                        <p className="mt-1 text-xl font-semibold text-emerald-700">
                            LKR {Number(summary.total_completed).toLocaleString('en-LK')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Total refunded</p>
                        <p className="mt-1 text-xl font-semibold text-red-600">
                            LKR {Number(summary.total_refunded).toLocaleString('en-LK')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Pending payments</p>
                        <p className="mt-1 text-xl font-semibold text-amber-600">{summary.pending_count}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Search by order ID or student name"
                            className="w-full rounded-xl border-gray-200 pl-9 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                        className="rounded-xl border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <button
                        onClick={() => applyFilters()}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Search
                    </button>
                </div>

                {payments.data.length === 0 ? (
                    <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="Try adjusting your filters."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Order ID</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.data.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.payhere_order_id}</td>
                                        <td className="px-4 py-3 text-gray-800">{p.student_profile.full_name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {p.booking.course.title}
                                            {p.voucher && (
                                                <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                                                    {p.voucher.code}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {p.currency} {Number(p.amount).toLocaleString('en-LK')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[p.status]}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString('en-LK')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {p.status === 'completed' && (
                                                <button
                                                    onClick={() => setRefundTarget(p)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-red-300 hover:text-red-600"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {refundTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Refund payment</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Refund {refundTarget.currency} {Number(refundTarget.amount).toLocaleString('en-LK')} to{' '}
                            {refundTarget.student_profile.full_name}? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRefundTarget(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRefund}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}