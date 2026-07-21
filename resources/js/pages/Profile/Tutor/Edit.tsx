import { useForm, Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { update, show } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';
import LoadingOverlay from '@/components/LoadingOverlay';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            <div className="max-w-2xl mx-auto p-6 relative">
                <LoadingOverlay show={processing} message="Updating Profile…" variant="card" />
                    <Head title="Edit Tutor Profile" />
                    <div className="max-w-2xl mx-auto p-6">
                        <h1 className="text-2xl font-semibold mb-6">Edit Tutor Profile</h1>

                        {/* Profile card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 flex items-center gap-5">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group shrink-0"
                            >
                                <div className="h-20 w-20 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-semibold text-white">
                                            {data.full_name?.charAt(0).toUpperCase() ?? '?'}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100
                                                flex items-center justify-center transition-opacity">
                                    <Camera className="size-6 text-white" />
                                </div>
                            </button>

                            <div className="min-w-0">
                                <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                    {data.full_name || 'Your Name'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {data.hourly_rate ? `LKR ${data.hourly_rate}/hr` : 'Tutor'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    Change photo
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        {errors.avatar && <p className="text-red-500 text-sm mb-4 -mt-4">{errors.avatar}</p>}

                        <form onSubmit={submit} className="space-y-4">

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
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">NIC Number</label>
                                <input
                                    type="text"
                                    value={data.nic_number}
                                    onChange={e => setData('nic_number', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.nic_number && <p className="text-red-500 text-sm mt-1">{errors.nic_number}</p>}
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

                            <div>
                                <label className="block text-sm font-medium mb-1">Bio</label>
                                <textarea
                                    value={data.bio}
                                    onChange={e => setData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Tell students about your teaching experience and qualifications..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Hourly Rate (LKR)</label>
                                <input
                                    type="number"
                                    value={data.hourly_rate}
                                    onChange={e => setData('hourly_rate', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    min="0"
                                />
                                {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Teaching Medium</label>
                                <select
                                    value={data.medium}
                                    onChange={e => setData('medium', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="english">English</option>
                                    <option value="sinhala">Sinhala</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="bilingual">Bilingual</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Subjects You Teach</label>
                                {errors.subjects && <p className="text-red-500 text-sm mb-2">{errors.subjects}</p>}

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">O/L Subjects</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {olSubjects.map(subject => (
                                                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.subjects.includes(subject.id)}
                                                        onChange={() => toggleSubject(subject.id)}
                                                    />
                                                    <span className="text-sm">{subject.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">A/L Subjects</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {alSubjects.map(subject => (
                                                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.subjects.includes(subject.id)}
                                                        onChange={() => toggleSubject(subject.id)}
                                                    />
                                                    <span className="text-sm">{subject.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Foundation</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {foundationSubjects.map(subject => (
                                                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.subjects.includes(subject.id)}
                                                        onChange={() => toggleSubject(subject.id)}
                                                    />
                                                    <span className="text-sm">{subject.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
            </div>
        </>
    );
}