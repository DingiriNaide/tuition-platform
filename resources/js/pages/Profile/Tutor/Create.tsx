import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';

interface Subject {
    id: number;
    name: string;
    syllabus: string;
}

interface Props {
    subjects: Subject[];
}

export default function Create({ subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        phone: '',
        nic_number: '',
        city: '',
        district: '',
        bio: '',
        hourly_rate: '',
        medium: 'english',
        subjects: [] as number[],
    });

    function toggleSubject(id: number) {
        const current = data.subjects;
        if (current.includes(id)) {
            setData('subjects', current.filter(s => s !== id));
        } else {
            setData('subjects', [...current, id]);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(store.url());
    }

    const olSubjects = subjects.filter(s => s.syllabus === 'ol');
    const alSubjects = subjects.filter(s => s.syllabus === 'al');
    const foundationSubjects = subjects.filter(s => s.syllabus === 'foundation');

    return (
        <AppLayout>
            <Head title="Create Tutor Profile" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Create Tutor Profile</h1>
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Create Profile'}
                    </button>

                </form>
            </div>
        </AppLayout>
    );
}