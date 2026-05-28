import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        phone: '',
        nic_number: '',
        city: '',
        district: '',
        bio: '',
        hourly_rate: '',
        medium: 'english',
    });


    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(store.url());
    }

    return (
        <AppLayout>
            <Head title="Create Tutor Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Create Tutor Profile</h1>
                <form onSubmit={submit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={e => setData('full_name', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">NIC Number</label>
                        <input
                            type="text"
                            value={data.nic_number}
                            onChange={e => setData('nic_number', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.nic_number && <p className="text-red-500 text-sm mt-1">{errors.nic_number}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">District</label>
                        <input
                            type="text"
                            value={data.district}
                            onChange={e => setData('district', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            type="text"
                            value={data.city}
                            onChange={e => setData('city', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                            value={data.bio}
                            onChange={e => setData('bio', e.target.value)}
                            rows={4}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Tell students about your teaching experience and qualifications..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Hourly Rate (LKR)</label>
                        <input
                            type="number"
                            value={data.hourly_rate}
                            onChange={e => setData('hourly_rate', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            min="0"
                        />
                        {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Teaching Medium</label>
                        <select
                            value={data.medium}
                            onChange={e => setData('medium', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="english">English</option>
                            <option value="sinhala">Sinhala</option>
                            <option value="tamil">Tamil</option>
                            <option value="bilingual">Bilingual</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Create Profile'}
                    </button>

                </form>
            </div>
        </AppLayout>
    );
}