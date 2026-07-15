import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/components/empty-state';
import { grade } from '@/actions/App/Http/Controllers/AssignmentController';
import { CheckCircle2, Paperclip, Users } from 'lucide-react';

interface SubmissionFile {
    name: string;
    url: string;
}

interface Submission {
    id: number;
    student_name: string;
    text_answer: string | null;
    objective_answers: Record<string, string> | null;
    auto_graded_score: number | null;
    final_score: number | null;
    tutor_feedback: string | null;
    status: 'pending' | 'submitted' | 'graded' | 'late';
    submitted_at: string | null;
    files: SubmissionFile[];
}

interface Question {
    id: string;
    text: string;
    options: string[];
    correct_answer: string;
    marks: number;
}

interface Assignment {
    id: number;
    title: string;
    type: 'objective' | 'subjective' | 'mixed';
    total_marks: number;
    questions: Question[] | null;
}

const statusBadge: Record<Submission['status'], { label: string; className: string }> = {
    pending: { label: 'Not submitted', className: 'bg-gray-100 text-gray-600' },
    submitted: { label: 'Submitted', className: 'bg-emerald-100 text-emerald-700' },
    late: { label: 'Late', className: 'bg-amber-100 text-amber-700' },
    graded: { label: 'Graded', className: 'bg-emerald-100 text-emerald-700' },
};

function GradeForm({ submission, totalMarks }: { submission: Submission; totalMarks: number }) {
    const { data, setData, post, processing } = useForm({
        final_score: submission.final_score ?? submission.auto_graded_score ?? 0,
        tutor_feedback: submission.tutor_feedback ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(grade.url(submission.id), {
            onSuccess: () => toast.success('Grade saved'),
            onError: () => toast.error('Could not save grade — check the score is within range'),
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Score</label>
                <input
                    type="number"
                    min={0}
                    max={totalMarks}
                    step={1}
                    value={data.final_score}
                    onChange={(e) => setData('final_score', Math.max(0, Math.min(totalMarks, Number(e.target.value))))}
                    className="w-20 rounded-lg border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-400">/ {totalMarks}</span>
            </div>

            <textarea
                value={data.tutor_feedback}
                onChange={(e) => setData('tutor_feedback', e.target.value)}
                rows={2}
                placeholder="Feedback for the student (optional)"
                className="w-full rounded-xl border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />

            <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
                {submission.status === 'graded' ? 'Update grade' : 'Save grade'}
            </button>
        </form>
    );
}

function SubmissionFilesList({ files }: { files: SubmissionFile[] }) {
    if (files.length === 0) {
        return null;
    }

    return (
        <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Attachments</h4>
            <div className="space-y-1">
                {files.map((file, i) => {
                    return (
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
                    );
                })}
            </div>
        </div>
    );
}

export default function AssignmentSubmissions({ assignment, submissions }: { assignment: Assignment; submissions: Submission[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <>
            <Head title={`Submissions — ${assignment.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="mb-1 text-2xl font-semibold text-gray-900">{assignment.title}</h1>
                <p className="mb-6 text-sm text-gray-500">
                    {submissions.length} submission{submissions.length !== 1 && 's'} · {assignment.total_marks} marks total
                </p>

                {submissions.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No submissions yet"
                        description="Students haven't submitted work for this assignment yet."
                    />
                ) : (
                    <div className="space-y-3">
                        {submissions.map((s) => {
                            const badge = statusBadge[s.status];
                            const isExpanded = expandedId === s.id;

                            return (
                                <div key={s.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                        className="flex w-full items-center justify-between text-left"
                                    >
                                        <div>
                                            <h3 className="font-medium text-gray-900">{s.student_name}</h3>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {s.submitted_at ? `Submitted ${s.submitted_at}` : 'Not submitted'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {s.status === 'graded' && (
                                                <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {s.final_score}/{assignment.total_marks}
                                                </span>
                                            )}
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                                            {assignment.questions && assignment.questions.length > 0 && s.objective_answers && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-gray-700">Objective answers</h4>
                                                    <div className="space-y-2">
                                                        {assignment.questions.map((q, i) => {
                                                            const studentAnswer = s.objective_answers?.[q.id];
                                                            const isCorrect = studentAnswer === q.correct_answer;
                                                            return (
                                                                <div key={q.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                                                                    <p className="font-medium text-gray-800">
                                                                        {i + 1}. {q.text}
                                                                    </p>
                                                                    <p className={isCorrect ? 'text-emerald-600' : 'text-red-500'}>
                                                                        Answered: {studentAnswer ?? '—'}
                                                                        {!isCorrect && ` (correct: ${q.correct_answer})`}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {s.auto_graded_score !== null && (
                                                        <p className="mt-2 text-xs text-gray-500">
                                                            Auto-graded: {s.auto_graded_score} marks from objective questions
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {s.text_answer && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-gray-700">Written answer</h4>
                                                    <p className="whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                                                        {s.text_answer}
                                                    </p>
                                                </div>
                                            )}

                                            <SubmissionFilesList files={s.files} />

                                            {!s.text_answer && !s.objective_answers && s.files.length === 0 && (
                                                <p className="text-sm text-gray-400">No submission content yet.</p>
                                            )}

                                            <GradeForm submission={s} totalMarks={assignment.total_marks} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}