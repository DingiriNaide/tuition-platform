import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
    nic_number: string;
    district: string;
    city: string;
    medium: string;
    hourly_rate: number;
    bio: string;
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_reviews: number;
    created_at: string;
    avatar_url: string | null;
    user: User;
    subjects: Subject[];
}

interface Props {
    tutor: TutorProfile;
}

export default function Show({ tutor }: Props) {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');

    function approve() {
        router.post(`/admin/tutors/${tutor.id}/approve`);
    }

    function reject() {
        router.post(`/admin/tutors/${tutor.id}/reject`, { reason });
        setRejecting(false);
    }

    const syllabusLabel: Record<string, string> = {
        ol: 'O/L', al: 'A/L', foundation: 'Foundation', general: 'General',
    };

    const subjectsByLevel = tutor.subjects?.reduce((acc, subject) => {
        const key = subject.syllabus;
        if (!acc[key]) acc[key] = [];
        acc[key].push(subject);
        return acc;
    }, {} as Record<string, Subject[]>) ?? {};

    return (
        <>
            <Head title={`Review — ${tutor.full_name}`} />
            <div className="max-w-3xl mx-auto p-6 space-y-6">

                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/tutors"
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        ← Back to list
                    </Link>
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {tutor.avatar_url ? (
                            <img
                                src={tutor.avatar_url}
                                alt={tutor.full_name}
                                className="size-14 rounded-full object-cover"
                            />
                        ) : (
                            <div className="size-14 rounded-full bg-emerald-600 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                    {tutor.full_name?.charAt(0).toUpperCase() ?? '?'}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold">{tutor.full_name}</h1>
                            <p className="text-gray-500 text-sm mt-1">{tutor.user.email}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tutor.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tutor.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
                    <h2 className="font-medium">Profile Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium">{tutor.phone ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">NIC Number</p>
                            <p className="font-medium">{tutor.nic_number ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">District</p>
                            <p className="font-medium">{tutor.district ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">City</p>
                            <p className="font-medium">{tutor.city ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Teaching Medium</p>
                            <p className="font-medium capitalize">{tutor.medium}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Hourly Rate</p>
                            <p className="font-medium">LKR {tutor.hourly_rate ?? '—'}</p>
                        </div>
                    </div>

                    {tutor.bio && (
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Bio</p>
                            <p className="text-sm">{tutor.bio}</p>
                        </div>
                    )}
                </div>

                {Object.keys(subjectsByLevel).length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-3">
                        <h2 className="font-medium">Subjects</h2>
                        {Object.entries(subjectsByLevel).map(([level, subs]) => (
                            <div key={level}>
                                <p className="text-xs font-medium text-gray-400 uppercase mb-2">{syllabusLabel[level] ?? level}</p>
                                <div className="flex flex-wrap gap-2">
                                    {subs.map(subject => (
                                        <span
                                            key={subject.id}
                                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                                        >
                                            {subject.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!tutor.is_verified && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
                        <h2 className="font-medium">Verification Decision</h2>

                        <AnimatePresence mode="wait">
                            {!rejecting ? (
                                <motion.div
                                    key="approve-reject"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex gap-3"
                                >
                                    <button
                                        onClick={approve}
                                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
                                    >
                                        Approve & Verify
                                    </button>
                                    <button
                                        onClick={() => setRejecting(true)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
                                    >
                                        Reject
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reject-form"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    <textarea
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        rows={3}
                                        placeholder="Reason for rejection (optional)..."
                                        className="w-full border rounded px-3 py-2 text-sm"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={reject}
                                            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => setRejecting(false)}
                                            className="flex-1 border py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {tutor.is_verified && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                        <h2 className="font-medium mb-3">Actions</h2>
                        <button
                            onClick={() => router.post(`/admin/tutors/${tutor.id}/reject`)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                        >
                            Revoke Verification
                        </button>
                    </div>
                )}

            </div>
        </>
    );
}