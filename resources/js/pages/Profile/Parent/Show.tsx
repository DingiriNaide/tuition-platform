import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/ParentProfileController';

interface ParentProfile {
    id: number;
    full_name: string;
    phone: string;
    district: string;
    city: string;
}

interface Props {
    profile: ParentProfile | null;
}

export default function Show({ profile }: Props) {
    if (!profile) {
        return (
            <AppLayout>
                <Head title="Parent Profile" />
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-semibold mb-4">No Profile Found</h1>
                    <p className="text-gray-500 mb-6">You haven't created a parent profile yet.</p>
                    <Link
                        href={create.url()}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Create Profile
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Parent Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Parent Profile</h1>
                    <Link
                        href={edit.url()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{profile.full_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{profile.phone ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">District</p>
                            <p className="font-medium">{profile.district ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="font-medium">{profile.city ?? '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}