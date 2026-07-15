import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '@/components/empty-state';
import { create, edit, destroy, submissions } from '@/actions/App/Http/Controllers/AssignmentController';
import { FileText, Pencil, Plus, Trash2, Users } from 'lucide-react';

interface Assignment {
    id: number;
    title: string;
    type: 'objective' | 'subjective' | 'mixed';
    total_marks: number;
    due_date: string | null;
    is_published: boolean;
    booking_id: number | null;
    submissions_count: number;
    graded_count: number;
}

interface Course {
    id: number;
    title: string;
}

export default function AssignmentsIndex({ course, assignments }: { course: Course; assignments: Assignment[] }) {
    const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(destroy.url(deleteTarget.id), {
            onSuccess: () => {
                toast.success('Assignment deleted');
                setDeleteTarget(null);
            },
            onError: () => toast.error('Could not delete assignment'),
        });
    };

    return (
        <>
            <Head title={`Assignments — ${course.title}`} />

            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
                        <p className="mt-1 text-sm text-gray-500">{course.title}</p>
                    </div>
                    <Link
                        href={create.url(course.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        New assignment
                    </Link>
                </div>

                {assignments.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No assignments yet"
                        description="Create your first assignment or homework task for this course."
                        action={{
                            label: 'New assignment',
                            href: create.url(course.id),
                        }}
                    />
                ) : (
                    <div className="space-y-3">
                        {assignments.map((a) => (
                            <div
                                key={a.id}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{a.title}</h3>
                                            {!a.is_published && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                    Draft
                                                </span>
                                            )}
                                            {a.booking_id && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                    Individual
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {a.type} · {a.total_marks} marks
                                            {a.due_date && ` · due ${new Date(a.due_date).toLocaleDateString('en-LK')}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Users className="h-4 w-4" />
                                            {a.graded_count}/{a.submissions_count} graded
                                        </div>
                                        <Link
                                            href={submissions.url(a.id)}
                                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                                        >
                                            <Users className="h-3.5 w-3.5" />
                                            View submissions
                                        </Link>
                                        <Link
                                            href={edit.url(a.id)}
                                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setDeleteTarget(a)}
                                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-red-300 hover:text-red-600"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Delete assignment</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            This will permanently delete "{deleteTarget.title}"
                            {deleteTarget.submissions_count > 0 &&
                                ` and its ${deleteTarget.submissions_count} student submission(s)`}
                            . This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}