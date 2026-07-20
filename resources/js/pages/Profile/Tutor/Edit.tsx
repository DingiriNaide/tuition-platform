import { useForm, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { update, show } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';

interface Subject {
    id: number;
    name: string;
    syllabus: string;
}

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
    subjects: Subject[];
    avatar_url: string | null;
}

interface Props {
    profile: TutorProfile;
    subjects: Subject[];
}

export default function Edit({ profile, subjects }: Props) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        full_name:   profile.full_name ?? '',
        phone:       profile.phone ?? '',
        nic_number:  profile.nic_number ?? '',
        city:        profile.city ?? '',
        district:    profile.district ?? '',
        bio:         profile.bio ?? '',
        hourly_rate: profile.hourly_rate ?? '',
        medium:      profile.medium ?? 'english',
        subjects:    profile.subjects?.map(s => s.id) ?? [] as number[],
        avatar:      null as File | null,
        _method:     'put',
    });

    function toggleSubject(id: number) {
        const current = data.subjects;
        if (current.includes(id)) {
            setData('subjects', current.filter(s => s !== id));
        } else {
            setData('subjects', [...current, id]);
        }
    }

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

    const olSubjects         = subjects.filter(s => s.syllabus === 'ol');
    const alSubjects         = subjects.filter(s => s.syllabus === 'al');
    const foundationSubjects = subjects.filter(s => s.syllabus === 'foundation');

    return (
        <>
            <Head title="Edit Tutor Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Edit Tutor Profile</h1>
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

                    {/* ...rest of the form unchanged... */}

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