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

interface Stats {
    linked_students: number;
    upcoming_classes: number;
    pending_payments: number;
}

interface Props {
    profile: ParentProfile | null;
    stats: Stats;
}

export default function ParentDashboard({ profile, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Parent Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {!profile && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">Complete your parent profile to monitor your children's progress.</p>
                        <Link
                            href={create.url()}
                            className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-600"
                        >
                            Create Profile
                        </Link>
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-semibold">
                        Welcome back{profile ? `, ${profile.full_name}` : ''}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Monitor your children's learning progress.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Linked Students</p>
                        <p className="text-3xl font-semibold mt-1">{stats.linked_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Upcoming Classes</p>
                        <p className="text-3xl font-semibold mt-1">{stats.upcoming_classes}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Pending Payments</p>
                        <p className="text-3xl font-semibold mt-1">{stats.pending_payments}</p>
                    </div>
                </div>

                {profile && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-medium">My Profile</h2>
                            <Link
                                href={edit.url()}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Edit
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="font-medium">{profile.phone ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">District</p>
                                <p className="font-medium">{profile.district ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">City</p>
                                <p className="font-medium">{profile.city ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                    <h2 className="font-medium mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Link a Student</p>
                            <p className="text-xs text-gray-500 mt-1">Connect your child's account</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">View Progress</p>
                            <p className="text-xs text-gray-500 mt-1">Check attendance and grades</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Payments</p>
                            <p className="text-xs text-gray-500 mt-1">Manage fees and invoices</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Find a Tutor</p>
                            <p className="text-xs text-gray-500 mt-1">Browse tutors for your child</p>
                        </button>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}