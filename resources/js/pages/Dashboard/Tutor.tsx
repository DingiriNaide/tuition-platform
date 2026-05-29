import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';
import { index, create } from '@/actions/App/Http/Controllers/CourseController'

interface Subject {
    id: number;
    name: string;
    syllabus: string;
}

interface TutorProfile {
    id: number;
    full_name: string;
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_reviews: number;
    hourly_rate: number;
    medium: string;
    subjects: Subject[];
}

interface Stats {
    total_students: number;
    upcoming_classes: number;
    pending_reviews: number;
    monthly_earnings: number;
}

interface Props {
    profile: TutorProfile | null;
    stats: Stats;
}

export default function TutorDashboard({ profile, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Tutor Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {!profile && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">Complete your tutor profile to start teaching.</p>
                        <Link
                            href={create.url()}
                            className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-600"
                        >
                            Create Profile
                        </Link>
                    </div>
                )}

                {profile && !profile.is_verified && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            Your profile is pending verification. An admin will review your details shortly.
                        </p>
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-semibold">
                        Welcome back{profile ? `, ${profile.full_name}` : ''}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's your teaching overview.</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-3xl font-semibold mt-1">{stats.total_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Upcoming Classes</p>
                        <p className="text-3xl font-semibold mt-1">{stats.upcoming_classes}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Pending Reviews</p>
                        <p className="text-3xl font-semibold mt-1">{stats.pending_reviews}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                        <p className="text-sm text-gray-500">Monthly Earnings</p>
                        <p className="text-3xl font-semibold mt-1">LKR {stats.monthly_earnings.toLocaleString()}</p>
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
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                                <p className="text-gray-500">Status</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${profile.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {profile.is_verified ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-500">Rating</p>
                                <p className="font-medium">{Number(profile.rating).toFixed(1)} ★ ({profile.total_reviews} reviews)</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Hourly Rate</p>
                                <p className="font-medium">LKR {profile.hourly_rate ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Medium</p>
                                <p className="font-medium capitalize">{profile.medium}</p>
                            </div>
                        </div>

                        {profile.subjects?.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.subjects.map(subject => (
                                        <span
                                            key={subject.id}
                                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                                        >
                                            {subject.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-5">
                    <h2 className="font-medium mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Create Course</p>
                            <p className="text-xs text-gray-500 mt-1">List a new course for students</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Schedule Class</p>
                            <p className="text-xs text-gray-500 mt-1">Set up an upcoming session</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">View Assignments</p>
                            <p className="text-xs text-gray-500 mt-1">Review student submissions</p>
                        </button>
                        <button className="border rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="font-medium text-sm">Earnings Report</p>
                            <p className="text-xs text-gray-500 mt-1">View your payment history</p>
                        </button>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">My Courses</h2>
                    <div className="flex gap-3">
                        <Link href={index.url()} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                            View all courses
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <Link href={create.url()} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                            Create new course
                        </Link>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}