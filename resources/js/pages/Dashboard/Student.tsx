import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/StudentProfileController';

interface StudentProfile {
    id: number;
    full_name: string;
    grade: string;
    medium: string;
    school: string;
    district: string;
}

interface Stats {
    upcoming_classes: number;
    completed_classes: number;
    assignments_due: number;
}

interface Props {
    profile: StudentProfile | null;
    stats: Stats;
}

export default function StudentDashboard({ profile, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Student Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {!profile && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">Complete your student profile to get started.</p>
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
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening with your studies.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Upcoming Classes</p>
                        <p className="text-3xl font-semibold mt-1">{stats.upcoming_classes}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Completed Classes</p>
                        <p className="text-3xl font-semibold mt-1">{stats.completed_classes}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Assignments Due</p>
                        <p className="text-3xl font-semibold mt-1">{stats.assignments_due}</p>
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
                                <p className="text-gray-500">Grade</p>
                                <p className="font-medium capitalize">{profile.grade?.replace('_', ' ') ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Medium</p>
                                <p className="font-medium capitalize">{profile.medium}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">School</p>
                                <p className="font-medium">{profile.school ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">District</p>
                                <p className="font-medium">{profile.district ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                    <h2 className="font-medium mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Find a Tutor</p>
                            <p className="text-xs text-gray-500 mt-1">Browse tutors by subject and grade</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">My Assignments</p>
                            <p className="text-xs text-gray-500 mt-1">View and submit pending work</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Past Papers</p>
                            <p className="text-xs text-gray-500 mt-1">Practice with exam resources</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Mock Exams</p>
                            <p className="text-xs text-gray-500 mt-1">Test yourself under exam conditions</p>
                        </button>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}