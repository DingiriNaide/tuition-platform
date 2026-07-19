import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/components/empty-state';
import { store, update, toggle, destroy } from '@/actions/App/Http/Controllers/Admin/SubjectController';
import { BookMarked, Pencil, Plus, Trash2 } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    name_sinhala: string | null;
    name_tamil: string | null;
    syllabus: string;
    is_active: boolean;
    courses_count: number;
}

interface Props {
    subjects: { data: Subject[]; total: number };
}

const syllabusLabels: Record<string, string> = {
    ol: 'O/L', al: 'A/L', foundation: 'Foundation', general: 'General',
};

export default function AdminSubjectsIndex({ subjects }: Props) {
    const [editing, setEditing] = useState<Subject | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', name_sinhala: '', name_tamil: '', syllabus: 'ol', is_active: true,
    });

    function openCreate(): void {
        reset();
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(subject: Subject): void {
        setData({
            name: subject.name,
            name_sinhala: subject.name_sinhala ?? '',
            name_tamil: subject.name_tamil ?? '',
            syllabus: subject.syllabus,
            is_active: subject.is_active,
        });
        setEditing(subject);
        setShowForm(true);
    }

    function submit(e: React.FormEvent): void {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(editing ? 'Subject updated' : 'Subject created');
            setShowForm(false);
            reset();
        };
        if (editing) {
            put(update.url(editing.id), { onSuccess });
        } else {
            post(store.url(), { onSuccess });
        }
    }

    function confirmDelete(): void {
        if (!deleteTarget) return;
        router.delete(destroy.url(deleteTarget.id), {
            onSuccess: () => { toast.success('Subject deleted'); setDeleteTarget(null); },
            onError: () => toast.error('Could not delete — subject may be in use'),
        });
    }

    return (
        <>
            <Head title="Manage Subjects" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" /> New subject
                    </button>
                </div>

                {subjects.data.length === 0 ? (
                    <EmptyState icon={BookMarked} title="No subjects yet" description="Add your first subject." />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Syllabus</th>
                                    <th className="px-4 py-3">Courses</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subjects.data.map((s) => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-3 text-gray-900">
                                            {s.name}
                                            {s.name_sinhala && <span className="ml-2 text-xs text-gray-400">{s.name_sinhala}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{syllabusLabels[s.syllabus] ?? s.syllabus}</td>
                                        <td className="px-4 py-3 text-gray-500">{s.courses_count}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => router.post(toggle.url(s.id))}
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-emerald-600">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(s)} className="text-gray-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            {editing ? 'Edit subject' : 'New subject'}
                        </h3>

                        <label className="block text-sm font-medium text-gray-700">Name (English)</label>
                        <input
                            type="text" value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 mb-3 w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {errors.name && <p className="mb-2 text-xs text-red-600">{errors.name}</p>}

                        <label className="block text-sm font-medium text-gray-700">Name (Sinhala)</label>
                        <input
                            type="text" value={data.name_sinhala}
                            onChange={(e) => setData('name_sinhala', e.target.value)}
                            className="mt-1 mb-3 w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />

                        <label className="block text-sm font-medium text-gray-700">Name (Tamil)</label>
                        <input
                            type="text" value={data.name_tamil}
                            onChange={(e) => setData('name_tamil', e.target.value)}
                            className="mt-1 mb-3 w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />

                        <label className="block text-sm font-medium text-gray-700">Syllabus</label>
                        <select
                            value={data.syllabus}
                            onChange={(e) => setData('syllabus', e.target.value)}
                            className="mt-1 mb-4 w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            {Object.entries(syllabusLabels).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                                {editing ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Delete subject</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Delete "{deleteTarget.name}"? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}