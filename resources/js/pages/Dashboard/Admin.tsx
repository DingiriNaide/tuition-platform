import { Head, Link } from '@inertiajs/react';

interface Stats {
    total_students: number;
    total_tutors: number;
    pending_verifications: number;
    total_subjects: number;
}

interface Props {
    stats: Stats;
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                <div>
                    <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Platform overview and management.</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-3xl font-semibold mt-1">{stats.total_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Total Tutors</p>
                        <p className="text-3xl font-semibold mt-1">{stats.total_tutors}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Pending Verifications</p>
                        <p className="text-3xl font-semibold mt-1 text-yellow-500">{stats.pending_verifications}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Total Subjects</p>
                        <p className="text-3xl font-semibold mt-1">{stats.total_subjects}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                    <h2 className="font-medium mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/admin/tutors"
                            className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition block"
                        >
                            <p className="font-medium text-sm">Verify Tutors</p>
                            <p className="text-xs text-gray-500 mt-1">Review pending tutor applications</p>
                        </Link>
                        <Link
                            href="/admin/subjects"
                            className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition block"
                        >
                            <p className="font-medium text-sm">Manage Subjects</p>
                            <p className="text-xs text-gray-500 mt-1">Add or update platform subjects</p>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition block"
                        >
                            <p className="font-medium text-sm">User Management</p>
                            <p className="text-xs text-gray-500 mt-1">View and manage all users</p>
                        </Link>
                        <Link
                            href="/admin/analytics"
                            className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition block"
                        >
                            <p className="font-medium text-sm">Platform Analytics</p>
                            <p className="text-xs text-gray-500 mt-1">Revenue, growth, and usage stats</p>
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}