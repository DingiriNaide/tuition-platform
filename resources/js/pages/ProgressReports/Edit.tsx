import { Head, useForm, Link } from '@inertiajs/react';
import { update } from '@/actions/App/Http/Controllers/ProgressReportController';
import { show as showReport } from '@/actions/App/Http/Controllers/ProgressReportController';

// ── Types ─────────────────────────────────────────────────────────────

interface Report {
    id: number;
    overall_grade: string | null;
    score: number | null;
    strengths: string | null;
    areas_for_improvement: string | null;
    tutor_comments: string | null;
    recommended_actions: string | null;
    period_start: string;
    period_end: string;
    total_sessions: number;
    attended_sessions: number;
    absent_sessions: number;
    late_sessions: number;
    is_published: boolean;
    course: { title: string; subject: { name: string } };
    student_profile: { full_name: string };
    booking: { id: number };
}

interface Props {
    report: Report;
    gradeOptions: Record<string, string>;
}

interface ReportForm {
    overall_grade: string;
    score: string;
    strengths: string;
    areas_for_improvement: string;
    tutor_comments: string;
    recommended_actions: string;
    period_start: string;
    period_end: string;
    total_sessions: string;
    attended_sessions: string;
    absent_sessions: string;
    late_sessions: string;
    is_published: boolean;
}

// ── Component ─────────────────────────────────────────────────────────

export default function ProgressReportEdit({ report, gradeOptions }: Props) {
    const { data, setData, put, processing, errors, transform } = useForm<ReportForm>({
        overall_grade:         report.overall_grade ?? '',
        score:                 report.score !== null ? String(report.score) : '',
        strengths:             report.strengths ?? '',
        areas_for_improvement: report.areas_for_improvement ?? '',
        tutor_comments:        report.tutor_comments ?? '',
        recommended_actions:   report.recommended_actions ?? '',
        period_start:          report.period_start,
        period_end:            report.period_end,
        total_sessions:        String(report.total_sessions),
        attended_sessions:     String(report.attended_sessions),
        absent_sessions:       String(report.absent_sessions),
        late_sessions:         String(report.late_sessions),
        is_published:          report.is_published,
    });

    function submit(e: React.FormEvent, publish: boolean): void {
        e.preventDefault();
        transform((d) => ({ ...d, is_published: publish }));
        put(update.url(report.id));
    }

    return (
        <>
            <Head title={`Edit Report — ${report.student_profile.full_name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <Link
                        href={showReport.url(report.id)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        Progress Report #{report.id}
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">Edit</span>
                </nav>

                <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Progress Report
                </h1>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {report.course.title} · {report.student_profile.full_name}
                </p>

                {/* Draft banner */}
                {!report.is_published && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                        <span className="text-amber-500">✎</span>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            This report is a <strong>draft</strong> — not yet visible to the student.
                            Publish it when ready.
                        </p>
                    </div>
                )}

                {report.is_published && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                        <span className="text-green-500">✓</span>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            This report is <strong>published</strong> and visible to the student.
                            Saving will update the published version.
                        </p>
                    </div>
                )}

                <form className="space-y-6">

                    {/* Assessment */}
                    <Card title="Assessment">

                        <Field label="Overall Grade" error={errors.overall_grade} required>
                            <select
                                value={data.overall_grade}
                                onChange={(e) => setData('overall_grade', e.target.value)}
                                className={inp(!!errors.overall_grade)}
                            >
                                <option value="">Select grade</option>
                                {Object.entries(gradeOptions).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Score (0–100)" error={errors.score}>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={data.score}
                                onChange={(e) => setData('score', e.target.value)}
                                className={inp(!!errors.score)}
                                placeholder="Optional numeric score"
                            />
                        </Field>

                        <Field label="Strengths" error={errors.strengths}>
                            <textarea
                                value={data.strengths}
                                onChange={(e) => setData('strengths', e.target.value)}
                                rows={3}
                                className={inp(!!errors.strengths)}
                                placeholder="What the student does well..."
                            />
                        </Field>

                        <Field label="Areas for Improvement" error={errors.areas_for_improvement}>
                            <textarea
                                value={data.areas_for_improvement}
                                onChange={(e) => setData('areas_for_improvement', e.target.value)}
                                rows={3}
                                className={inp(!!errors.areas_for_improvement)}
                                placeholder="Topics or skills that need more work..."
                            />
                        </Field>

                        <Field label="Tutor Comments" error={errors.tutor_comments}>
                            <textarea
                                value={data.tutor_comments}
                                onChange={(e) => setData('tutor_comments', e.target.value)}
                                rows={4}
                                className={inp(!!errors.tutor_comments)}
                                placeholder="Overall observations and feedback..."
                            />
                        </Field>

                        <Field label="Recommended Actions" error={errors.recommended_actions}>
                            <textarea
                                value={data.recommended_actions}
                                onChange={(e) => setData('recommended_actions', e.target.value)}
                                rows={3}
                                className={inp(!!errors.recommended_actions)}
                                placeholder="Steps the student should take next..."
                            />
                        </Field>
                    </Card>

                    {/* Period */}
                    <Card title="Report Period">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Period Start" error={errors.period_start} required>
                                <input
                                    type="date"
                                    value={data.period_start}
                                    onChange={(e) => setData('period_start', e.target.value)}
                                    className={inp(!!errors.period_start)}
                                />
                            </Field>
                            <Field label="Period End" error={errors.period_end} required>
                                <input
                                    type="date"
                                    value={data.period_end}
                                    onChange={(e) => setData('period_end', e.target.value)}
                                    className={inp(!!errors.period_end)}
                                />
                            </Field>
                        </div>
                    </Card>

                    {/* Attendance snapshot */}
                    <Card title="Attendance Summary">
                        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                            Adjust session counts if they differ from the auto-calculated values.
                        </p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {([
                                { key: 'total_sessions',    label: 'Total' },
                                { key: 'attended_sessions', label: 'Attended' },
                                { key: 'absent_sessions',   label: 'Absent' },
                                { key: 'late_sessions',     label: 'Late' },
                            ] as const).map(({ key, label }) => (
                                <Field key={key} label={label} error={errors[key]}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        className={inp(!!errors[key])}
                                    />
                                </Field>
                            ))}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-3">
                        <Link
                            href={showReport.url(report.id)}
                            className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Link>

                        {/* Save as draft — always available */}
                        <button
                            type="button"
                            disabled={processing}
                            onClick={(e) => submit(e, false)}
                            className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {processing ? 'Saving…' : 'Save as Draft'}
                        </button>

                        {/* Publish / Save published */}
                        <button
                            type="button"
                            disabled={processing}
                            onClick={(e) => submit(e, true)}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing
                                ? 'Saving…'
                                : report.is_published
                                    ? 'Save Changes'
                                    : 'Publish to Student'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ── Shared utilities ──────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                {title}
            </h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function inp(hasError: boolean): string {
    return [
        'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
        'focus:outline-none focus:ring-2',
        hasError
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
    ].join(' ');
}
