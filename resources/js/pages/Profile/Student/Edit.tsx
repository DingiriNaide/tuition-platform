import { useForm, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { update, show } from '@/actions/App/Http/Controllers/ProfileController/StudentProfileController';

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
    avatar_url: string | null;
}

interface Props {
    profile: StudentProfile;
}

export default function Edit({ profile }: Props) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        full_name: profile.full_name ?? '',
        date_of_birth: profile.date_of_birth ?? '',
        gender: profile.gender ?? '',
        phone: profile.phone ?? '',
        school: profile.school ?? '',
        grade: profile.grade ?? '',
        medium: profile.medium ?? 'english',
        district: profile.district ?? '',
        city: profile.city ?? '',
        is_low_income: profile.is_low_income ?? false,
        avatar: null as File | null,
        _method: 'put',
    });

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('avatar', file);

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(update.url(), { forceFormData: true });
    }

    return (
        <>
            <Head title="Edit Student Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Edit Student Profile</h1>
                <form onSubmit={submit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-2">Avatar</label>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg font-semibold text-gray-500">
                                        {profile.full_name?.charAt(0).toUpperCase() ?? '?'}
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleAvatarChange}
                                className="text-sm"
                            />
                        </div>
                        {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
                    </div>

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
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={data.date_of_birth}
                            onChange={e => setData('date_of_birth', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select
                            value={data.gender}
                            onChange={e => setData('gender', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
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
                        <label className="block text-sm font-medium mb-1">School</label>
                        <input
                            type="text"
                            value={data.school}
                            onChange={e => setData('school', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Grade</label>
                        <select
                            value={data.grade}
                            onChange={e => setData('grade', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Select grade</option>
                            <option value="grade_6">Grade 6</option>
                            <option value="grade_7">Grade 7</option>
                            <option value="grade_8">Grade 8</option>
                            <option value="grade_9">Grade 9</option>
                            <option value="grade_10">Grade 10</option>
                            <option value="grade_11">Grade 11 (O/L)</option>
                            <option value="al_1">A/L Year 1</option>
                            <option value="al_2">A/L Year 2</option>
                            <option value="al_3">A/L Year 3</option>
                            <option value="foundation">Foundation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Medium</label>
                        <select
                            value={data.medium}
                            onChange={e => setData('medium', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="english">English</option>
                            <option value="sinhala">Sinhala</option>
                            <option value="tamil">Tamil</option>
                        </select>
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_low_income}
                            onChange={e => setData('is_low_income', e.target.checked)}
                            id="is_low_income"
                        />
                        <label htmlFor="is_low_income" className="text-sm">Low income household</label>
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
        </>
    );
}