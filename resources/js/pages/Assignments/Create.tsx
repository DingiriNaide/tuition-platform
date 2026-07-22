import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';
import { store, update } from '@/actions/App/Http/Controllers/AssignmentController';
import { Plus, Trash2, Upload } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

interface Student {
    id: number;
    student_profile: { id: number; full_name: string };
}

interface Question {
    id: string;
    text: string;
    options: string[];
    correct_answer: string;
    marks: number;
}

interface ExistingAssignment {
    id: number;
    booking_id: number | null;
    title: string;
    description: string | null;
    type: 'objective' | 'subjective' | 'mixed';
    questions: Question[];
    total_marks: number;
    due_date: string | null;
    is_published: boolean;
    existing_attachments: { id: number; name: string; url: string }[];
}

export default function CreateAssignment({
    course,
    students = [],
    assignment,
}: {
    course: { id: number; title: string };
    students?: Student[];
    assignment?: ExistingAssignment;
}) {
    const isEditing = !!assignment;

    const { data, setData, post, processing, errors } = useForm({
        booking_id: assignment?.booking_id ? String(assignment.booking_id) : '',
        title: assignment?.title ?? '',
        description: assignment?.description ?? '',
        type: assignment?.type ?? 'subjective',
        questions: assignment?.questions ?? [],
        total_marks: assignment?.total_marks ?? 100,
        due_date: assignment?.due_date ?? '',
        is_published: assignment?.is_published ?? false,
        attachments: [] as File[],
    });

    const computedTotalFromQuestions = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    const isAutoSummed = data.type === 'objective' || data.type === 'mixed';

    useEffect(() => {
        if (isAutoSummed) {
            setData('total_marks', computedTotalFromQuestions);
        }
    }, [computedTotalFromQuestions, isAutoSummed]);

    const addQuestion = () => {
        setData('questions', [
            ...data.questions,
            { id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 },
        ]);
    };

    const removeQuestion = (id: string) =>
        setData('questions', data.questions.filter((q) => q.id !== id));

    const updateQuestion = (id: string, patch: Partial<Question>) =>
        setData('questions', data.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            post(update.url(assignment.id), {
                forceFormData: true,
                onSuccess: () => toast.success('Assignment updated'),
                //onError: () => toast.error('Please check the form for errors'),
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    toast.error('Please check the form for errors');
                },
            });
        } else {
            post(store.url(course.id), {
                forceFormData: true,
                onSuccess: () => toast.success('Assignment created'),
                //onError: () => toast.error('Please check the form for errors'),
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    toast.error('Please check the form for errors');
                },
            });
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto p-6 relative">
                <LoadingOverlay show={processing} message="Creating Assignment…" variant="card" />
                    <Head title={isEditing ? `Edit — ${course.title}` : `New assignment — ${course.title}`} />

                    <div className="mx-auto max-w-3xl px-4 py-8">
                        <h1 className="mb-1 text-2xl font-semibold text-gray-900">
                            {isEditing ? 'Edit assignment' : 'New assignment'}
                        </h1>
                        <p className="mb-6 text-sm text-gray-500">{course.title}</p>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="e.g. Chapter 4 — Algebra worksheet"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}

                                <label className="mt-4 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                />

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Assign to</label>
                                        <select
                                            value={data.booking_id}
                                            onChange={(e) => setData('booking_id', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        >
                                            <option value="">Whole course</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.student_profile.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value as any)}
                                            className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        >
                                            <option value="subjective">Subjective (text answer)</option>
                                            <option value="objective">Objective (MCQ, auto-graded)</option>
                                            <option value="mixed">Mixed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total marks</label>
                                        {isAutoSummed ? (
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                                    {data.total_marks} <span className="text-gray-400">(sum of question marks)</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type="number"
                                                min={1}
                                                max={1000}
                                                value={data.total_marks}
                                                onChange={(e) => setData('total_marks', Math.max(1, Math.min(1000, Number(e.target.value))))}
                                                className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due date</label>
                                        <input
                                            type="datetime-local"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {(data.type === 'objective' || data.type === 'mixed') && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">Questions</h3>
                                        {isAutoSummed && data.questions.length === 0 && (
                                            <p className="mb-3 text-xs text-amber-600">Add at least one question — total marks will be calculated automatically.</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add question
                                        </button>
                                    </div>

                                    {data.questions.map((q, i) => (
                                        <div key={q.id} className="mb-4 rounded-md border border-gray-100 p-4">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <input
                                                    type="text"
                                                    value={q.text}
                                                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                                    placeholder={`Question ${i + 1}`}
                                                    className="flex-1 rounded-md border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                                <button type="button" onClick={() => removeQuestion(q.id)}>
                                                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(q.options ?? []).map((opt, oi) => (
                                                    <input
                                                        key={oi}
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const opts = [...q.options];
                                                            opts[oi] = e.target.value;
                                                            updateQuestion(q.id, { options: opts });
                                                        }}
                                                        placeholder={`Option ${oi + 1}`}
                                                        className="rounded-md border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                ))}
                                            </div>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <select
                                                    value={q.correct_answer}
                                                    onChange={(e) => updateQuestion(q.id, { correct_answer: e.target.value })}
                                                    className="rounded-md border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                >
                                                    <option value="">Correct answer…</option>
                                                    {(q.options ?? []).map((opt, oi) => (
                                                        <option key={oi} value={opt}>
                                                            {opt || `Option ${oi + 1}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={q.marks}
                                                    onChange={(e) => updateQuestion(q.id, { marks: Math.max(0, Math.min(100, Number(e.target.value))) })}
                                                    placeholder="Marks"
                                                    className="rounded-md border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700">Attachments (optional)</label>

                                {isEditing && assignment.existing_attachments.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {assignment.existing_attachments.map((file) => (
                                            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-emerald-600 hover:underline">
                                                {file.name}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-emerald-400">
                                    <Upload className="h-4 w-4" />
                                    {data.attachments.length > 0
                                        ? `${data.attachments.length} file(s) selected`
                                        : 'Attach worksheet PDF, images, etc.'}
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setData('attachments', Array.from(e.target.files ?? []))}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Publish immediately (students can see it)
                                </label>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {isEditing ? 'Save changes' : 'Create assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
            </div>
        </>
    );
}