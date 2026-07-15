import { Head, router } from '@inertiajs/react';
import EmptyState from '@/components/empty-state';
import { DollarSign, TrendingUp, Wallet, Clock } from 'lucide-react';

interface Payout {
    id: number;
    gross_amount: string;
    commission_rate: string;
    commission_amount: string;
    net_amount: string;
    status: 'pending' | 'processed' | 'paid';
    paid_at: string | null;
    created_at: string;
    payment: {
        student_profile: { full_name: string };
        booking: {
            course: { title: string; subject: { name: string } };
        };
    };
}

interface Props {
    payouts: {
        data: Payout[];
        total: number;
        current_page: number;
        last_page: number;
    };
    summary: {
        total_earned: string;
        total_pending: string;
        total_paid: string;
        total_gross: string;
        total_commission: string;
        sessions_paid: number;
    };
    monthlyTrend: { month: string; total: string }[];
    filters: { status?: string };
}

const statusColors: Record<Payout['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    processed: 'bg-blue-100 text-blue-700',
    paid: 'bg-emerald-100 text-emerald-700',
};

export default function TutorEarnings({ payouts, summary, monthlyTrend, filters }: Props) {
    const applyFilter = (status: string) => {
        router.get('/tutor/earnings', { status }, { preserveState: true, replace: true });
    };

    const maxTrend = Math.max(...monthlyTrend.map((m) => Number(m.total)), 1);

    return (
        <>
            <Head title="Earnings" />

            <div className="mx-auto max-w-5xl px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold text-gray-900">Earnings</h1>

                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Wallet className="h-3.5 w-3.5" />
                            Net earned
                        </div>
                        <p className="mt-1 text-xl font-semibold text-emerald-700">
                            LKR {Number(summary.total_earned).toLocaleString('en-LK')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            Pending payout
                        </div>
                        <p className="mt-1 text-xl font-semibold text-amber-600">
                            LKR {Number(summary.total_pending).toLocaleString('en-LK')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <DollarSign className="h-3.5 w-3.5" />
                            Already paid out
                        </div>
                        <p className="mt-1 text-xl font-semibold text-gray-900">
                            LKR {Number(summary.total_paid).toLocaleString('en-LK')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Platform fee taken
                        </div>
                        <p className="mt-1 text-xl font-semibold text-gray-500">
                            LKR {Number(summary.total_commission).toLocaleString('en-LK')}
                        </p>
                    </div>
                </div>

                {/* Simple bar trend */}
                {monthlyTrend.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-medium text-gray-700">Last 6 months</h3>
                        <div className="flex items-end gap-3" style={{ height: 120 }}>
                            {monthlyTrend.map((m) => (
                                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                                    <div
                                        className="w-full rounded-t-lg bg-emerald-500"
                                        style={{ height: `${(Number(m.total) / maxTrend) * 100}px` }}
                                    />
                                    <span className="text-xs text-gray-400">{m.month.slice(5)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="mb-4 flex gap-2">
                    {['', 'pending', 'processed', 'paid'].map((s) => (
                        <button
                            key={s}
                            onClick={() => applyFilter(s)}
                            className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                                (filters.status ?? '') === s
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-gray-200 text-gray-600 hover:border-emerald-300'
                            }`}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                {payouts.data.length === 0 ? (
                    <EmptyState
                        icon={DollarSign}
                        title="No earnings yet"
                        description="Payouts appear here once students complete payments for your sessions."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Gross</th>
                                    <th className="px-4 py-3">Commission</th>
                                    <th className="px-4 py-3">Net</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.data.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-gray-800">{p.payment.student_profile.full_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.payment.booking.course.title}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            LKR {Number(p.gross_amount).toLocaleString('en-LK')}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            −LKR {Number(p.commission_amount).toLocaleString('en-LK')} ({p.commission_rate}%)
                                        </td>
                                        <td className="px-4 py-3 font-medium text-emerald-700">
                                            LKR {Number(p.net_amount).toLocaleString('en-LK')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[p.status]}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString('en-LK')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}