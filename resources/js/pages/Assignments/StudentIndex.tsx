import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/components/empty-state';
import { submit } from '@/actions/App/Http/Controllers/AssignmentController';
import { CheckCircle2, Clock, FileText, Upload, Paperclip } from 'lucide-react';

interface Submission {
    id: number;
    status: 'pending' | 'submitted' | 'graded' | 'late';
    final_score: number | null;
    tutor_feedback: string | null;
}

interface Assignment {
    id: number;
    title: string;
    description: string | null;
    type: 'objective' | 'subjective' | 'mixed';
    total_marks: number;
    due_date: string | null;
    questions: { id: string; text: string; options: string[]; marks: number }[] | null;
    submissions: Submission[];
    attachments: { name: string; url: string }[]; // ← add this
}

const statusBadge: Record<Submission['status'], { label: string; className: string }> = {
    pending: { label: 'Not submitted', className: 'bg-gray-100 text-gray-600' },
    submitted: { label: 'Submitted', className: 'bg-emerald-100 text-emerald-700' },
    late: { label: 'Submitted late', className: 'bg-amber-100 text-amber-700' },
    graded: { label: 'Graded', className: 'bg-emerald-100 text-emerald-700' },
};

function SubmissionForm({ assignment }: { assignment: Assignment }) {
    const [expanded, setExpanded] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        text_answer: '',
        objective_answers: {} as Record<string, string>,
        files: [] as File[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(submit.url(assignment.id), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Homework submitted');
                reset();
                setExpanded(false);
            },
            onError: () => toast.error('Submission failed — check your answers'),
        });
    };

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
                Submit homework
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            {assignment.questions?.map((q, i) => (
                <div key={q.id}>
                    <p className="text-sm font-medium text-gray-700">
                        {i + 1}. {q.text}
                    </p>
                    <div className="mt-2 space-y-1">
                        {(q.options ?? []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="radio"
                                    name={q.id}
                                    checked={data.objective_answers[q.id] === opt}
                                    onChange={() =>
                                        setData('objective_answers', { ...data.objective_answers, [q.id]: opt })
                                    }
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {(assignment.type === 'subjective' || assignment.type === 'mixed') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Your answer</label>
                    <textarea
                        value={data.text_answer}
                        onChange={(e) => setData('text_answer', e.target.value)}
                        rows={4}
                        className="mt-1 w-full rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-emerald-400">
                <Upload className="h-4 w-4" />
                {data.files.length > 0 ? `${data.files.length} file(s) selected` : 'Attach photo or PDF (optional)'}
                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setData('files', Array.from(e.target.files ?? []))}
                />
            </label>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setExpanded(false)} className="px-4 py-2 text-sm text-gray-500">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    Submit
                </button>
            </div>
        </form>
    );
}

export default function StudentAssignments({ assignments }: { assignments: Assignment[] }) {
    return (
        <>
            <Head title="Assignments" />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold text-gray-900">Assignments</h1>

                {assignments.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No assignments yet"
                        description="Your tutor hasn't posted any homework."
                    />
                ) : (
                    <div className="space-y-4">
                        {assignments.map((a) => {
                            const sub = a.submissions[0];
                            const badge = statusBadge[sub?.status ?? 'pending'];
                            const isOverdue = a.due_date && new Date(a.due_date) < new Date() && !sub;

                            return (
                                <div key={a.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{a.title}</h3>
                                            {a.description && <p className="mt-1 text-sm text-gray-500">{a.description}</p>}
                                            {a.attachments.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {a.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {a.attachments.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline"
                                                        >
                                                            <Paperclip className="h-3.5 w-3.5" />
                                                            {file.name}
                                                        </a>
                                                        ))}
                                                    </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                {a.due_date
                                                    ? `Due ${new Date(a.due_date).toLocaleString('en-LK')}`
                                                    : 'No due date'}
                                                {' · '}
                                                {a.total_marks} marks
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {sub?.status === 'graded' ? (
                                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                            <div>
                                                <p className="font-medium text-emerald-800">
                                                    Score: {sub.final_score}/{a.total_marks}
                                                </p>
                                                {sub.tutor_feedback && (
                                                    <p className="mt-1 text-emerald-700">{sub.tutor_feedback}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : sub ? (
                                        <p className="mt-3 text-sm text-gray-500">Awaiting grading.</p>
                                    ) : isOverdue ? (
                                        <p className="mt-3 text-sm text-red-500">Overdue — you can still submit late.</p>
                                    ) : null}

                                    {!sub && <div className="mt-3"><SubmissionForm assignment={a} /></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}