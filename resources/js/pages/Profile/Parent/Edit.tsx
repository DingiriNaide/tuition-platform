import { useForm, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { update, show } from '@/actions/App/Http/Controllers/ProfileController/ParentProfileController';

interface ParentProfile {
    id: number;
    full_name: string;
    phone: string;
    district: string;
    city: string;
}

interface Props {
    profile: ParentProfile;
}

export default function Edit({ profile }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        district: profile.district ?? '',
        city: profile.city ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(update.url());
    }

    return (
        <AppLayout>
            <Head title="Edit Parent Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Edit Parent Profile</h1>
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

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Profile'}
                        </button>
                        
                        <Link
                            href={show.url()}
                            className="flex-1 text-center border py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}