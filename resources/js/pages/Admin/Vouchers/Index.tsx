import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { toggle } from '@/actions/App/Http/Controllers/Admin/VoucherController';
import { destroy } from '@/actions/App/Http/Controllers/Admin/VoucherController';
import { store } from '@/actions/App/Http/Controllers/Admin/VoucherController';

interface Voucher {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: string;
    is_low_income_only: boolean;
    max_uses: number | null;
    times_used: number;
    expires_at: string | null;
    is_active: boolean;
}

interface Props {
    vouchers: { data: Voucher[]; last_page: number; links: any[] };
}

function CreateForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        is_low_income_only: false,
        max_uses: '',
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), { onSuccess: () => reset() });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Voucher</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
                    <input type="text" value={data.code}
                        onChange={e => setData('code', e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SCHOLAR10" />
                    {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value as any)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (LKR)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Value ({data.type === 'percentage' ? '%' : 'LKR'})
                    </label>
                    <input type="number" value={data.value}
                        onChange={e => setData('value', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={data.type === 'percentage' ? '10' : '500'} />
                    {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
                    <input type="number" value={data.max_uses}
                        onChange={e => setData('max_uses', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unlimited" />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expires At</label>
                    <input type="date" value={data.expires_at}
                        onChange={e => setData('expires_at', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="low_income" checked={data.is_low_income_only}
                        onChange={e => setData('is_low_income_only', e.target.checked)}
                        className="rounded" />
                    <label htmlFor="low_income" className="text-sm text-gray-700">
                        Low-income students only
                    </label>
                </div>

                <div className="col-span-2">
                    <button type="submit" disabled={processing}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                                   text-white font-semibold px-6 py-2.5 text-sm transition-colors">
                        {processing ? 'Creating...' : 'Create Voucher'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ vouchers }: Props) {
    const toggleForm  = useForm({});
    const destroyForm = useForm({});

    return (
        <AppLayout>
            <Head title="Voucher Management" />
            <div className="max-w-5xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Voucher Management</h1>

                <CreateForm />

                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {['Code', 'Type', 'Value', 'Uses', 'Expires', 'Low Income', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vouchers.data.map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{v.code}</td>
                                    <td className="px-4 py-3 capitalize text-gray-600">{v.type}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {v.type === 'percentage' ? `${v.value}%` : `LKR ${Number(v.value).toLocaleString('en-LK')}`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {v.times_used}{v.max_uses ? ` / ${v.max_uses}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString('en-LK') : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {v.is_low_income_only
                                            ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Yes</span>
                                            : <span className="text-xs text-gray-400">No</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                                            ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {v.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => toggleForm.post(toggle.url(v.id))}
                                                disabled={toggleForm.processing}
                                                className={`text-xs hover:underline
                                                    ${v.is_active ? 'text-amber-600' : 'text-green-600'}`}>
                                                {v.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this voucher?')) {
                                                        destroyForm.delete(destroy.url(v.id));
                                                    }
                                                }}
                                                disabled={destroyForm.processing}
                                                className="text-xs text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}