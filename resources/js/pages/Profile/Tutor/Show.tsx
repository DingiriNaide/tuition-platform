import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';

interface TutorProfile {
    id: number;
    full_name: string;
    phone: string;
    nic_number: string;
    city: string;
    district: string;
    bio: string;
    hourly_rate: number;
    medium: string;
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_reviews: number;
}

interface Props {
    profile: TutorProfile | null;
}

export default function Show({ profile }: Props) {
    if (!profile) {
        return (
            <AppLayout>
                <Head title="Tutor Profile" />
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-semibold mb-4">No Profile Found</h1>
                    <p className="text-gray-500 mb-6">You haven't created a tutor profile yet.</p>
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
            <Head title="Tutor Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Tutor Profile</h1>
                    <Link
                        href={edit.url()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-6">

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {profile.is_verified ? 'Verified' : 'Pending Verification'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {profile.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-2xl font-semibold">{profile.rating.toFixed(1)} ★</p>
                            <p className="text-sm text-gray-500">{profile.total_reviews} reviews</p>
                        </div>
                    </div>

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
                            <p className="text-sm text-gray-500">NIC Number</p>
                            <p className="font-medium">{profile.nic_number ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Teaching Medium</p>
                            <p className="font-medium capitalize">{profile.medium}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">District</p>
                            <p className="font-medium">{profile.district ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="font-medium">{profile.city ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Hourly Rate</p>
                            <p className="font-medium">LKR {profile.hourly_rate ?? '—'}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 mb-1">Bio</p>
                        <p className="text-gray-700 dark:text-gray-300">{profile.bio ?? '—'}</p>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}