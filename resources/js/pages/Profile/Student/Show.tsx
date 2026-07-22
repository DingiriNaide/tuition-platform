import { Head, Link } from '@inertiajs/react';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/StudentProfileController';

interface StudentProfile {
    id: number;
    full_name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    school: string;
    grade: string;
    medium: string;
    district: string;
    city: string;
    is_low_income: boolean;
}

interface Props {
    profile: StudentProfile | null;
}

export default function Show({ profile }: Props) {
    if (!profile) {
        return (
            <>
                <Head title="Student Profile" />
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-semibold mb-4">No Profile Found</h1>
                    <p className="text-gray-500 mb-6">You haven't created a student profile yet.</p>
                    <Link
                        href={create.url()}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Create Profile
                    </Link>
                </div>
            </>
        );
    }

    const gradeLabels: Record<string, string> = {
        grade_6: 'Grade 6', grade_7: 'Grade 7', grade_8: 'Grade 8',
        grade_9: 'Grade 9', grade_10: 'Grade 10', grade_11: 'Grade 11 (O/L)',
        al_1: 'A/L Year 1', al_2: 'A/L Year 2', al_3: 'A/L Year 3',
        foundation: 'Foundation',
    };

    return (
        <>
            <Head title="Student Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Student Profile</h1>
                    <Link
                        href={edit.url()}
                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{profile.full_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{profile.date_of_birth ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium capitalize">{profile.gender ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{profile.phone ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">School</p>
                            <p className="font-medium">{profile.school ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Grade</p>
                            <p className="font-medium">{gradeLabels[profile.grade] ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Medium</p>
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
                            <p className="text-sm text-gray-500">Low Income</p>
                            <p className="font-medium">{profile.is_low_income ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}