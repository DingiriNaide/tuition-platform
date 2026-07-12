import { Head, Link, router } from '@inertiajs/react';

interface Subject {
    id: number;
    name: string;
    syllabus: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface TutorProfile {
    id: number;
    full_name: string;
    phone: string;
    district: string;
    city: string;
    medium: string;
    hourly_rate: number;
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_reviews: number;
    created_at: string;
    user: User;
    subjects: Subject[];
}

interface Props {
    pending: TutorProfile[];
    verified: TutorProfile[];
}

export default function Index({ pending, verified }: Props) {
    return (
        <>
            <Head title="Tutor Verification" />
            <div className="max-w-5xl mx-auto p-6 space-y-8">

                <div>
                    <h1 className="text-2xl font-semibold">Tutor Verification</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and approve tutor applications.</p>
                </div>

                <div>
                    <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                        Pending Verification
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {pending.length}
                        </span>
                    </h2>

                    {pending.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 text-center text-gray-500 text-sm">
                            No pending applications.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map(tutor => (
                                <div key={tutor.id} className="bg-white dark:bg-gray-800 rounded-lg border p-5 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium">{tutor.full_name}</p>
                                        <p className="text-sm text-gray-500">{tutor.user.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {tutor.subjects.map(s => (
                                                <span key={s.id} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <p className="text-sm text-gray-500">LKR {tutor.hourly_rate ?? '—'}/hr</p>
                                        <p className="text-sm text-gray-500 capitalize">{tutor.medium}</p>
                                        <Link
                                            href={`/admin/tutors/${tutor.id}`}
                                            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                        Verified Tutors
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {verified.length}
                        </span>
                    </h2>

                    {verified.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 text-center text-gray-500 text-sm">
                            No verified tutors yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {verified.map(tutor => (
                                <div key={tutor.id} className="bg-white dark:bg-gray-800 rounded-lg border p-5 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium">{tutor.full_name}</p>
                                        <p className="text-sm text-gray-500">{tutor.user.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {tutor.subjects.map(s => (
                                                <span key={s.id} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                        <p className="text-sm text-gray-500">LKR {tutor.hourly_rate ?? '—'}/hr</p>
                                        <Link
                                            href={`/admin/tutors/${tutor.id}`}
                                            className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}