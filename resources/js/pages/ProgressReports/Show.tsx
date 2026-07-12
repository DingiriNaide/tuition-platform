import { Head, Link, usePage } from '@inertiajs/react';
import { edit, index } from '@/actions/App/Http/Controllers/ProgressReportController';

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
    published_at: string | null;
    course: { title: string; subject: { name: string } };
    student_profile: { full_name: string };
    tutor_profile: { full_name: string };
    booking: { id: number };
}

interface Props {
    report: Report;
    gradeOptions: Record<string, string>;
    gradeColors: Record<string, string>;
}

const colorClasses: Record<string, string> = {
    green:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    blue:   'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    red:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ProgressReportShow({ report, gradeOptions, gradeColors }: Props) {
    const { auth } = usePage<{ auth: { user: { roles: string[] } } }>().props;
    const isTutor = auth.user.roles?.some((r) => ['tutor', 'admin', 'super-admin'].includes(r));

    const attendanceRate = report.total_sessions > 0
        ? Math.round((report.attended_sessions / report.total_sessions) * 100)
        : 0;

    const gradeColor = report.overall_grade
        ? gradeColors[report.overall_grade] ?? 'gray'
        : 'gray';

    return (
        <>
            <Head title={`Progress Report — ${report.student_profile.full_name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Progress Report
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {report.course.title} · {report.course.subject.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(report.period_start)} → {formatDate(report.period_end)}
                        </p>
                    </div>
                    {isTutor && (
                        <Link
                            href={edit.url(report.id)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Edit
                        </Link>
                    )}
                </div>

                <div className="space-y-5">

                    {/* Grade + score hero */}
                    {report.overall_grade && (
                        <div className={`rounded-lg p-6 text-center ${colorClasses[gradeColor]}`}>
                            <p className="text-4xl font-bold">
                                {report.score !== null ? `${report.score}/100` : '—'}
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {gradeOptions[report.overall_grade]}
                            </p>
                        </div>
                    )}

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard label="Student" value={report.student_profile.full_name} />
                        <InfoCard label="Tutor" value={report.tutor_profile.full_name} />
                    </div>

                    {/* Attendance snapshot */}
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Attendance
                        </h2>
                        <div className="mb-3 grid grid-cols-4 gap-3 text-center">
                            {[
                                { label: 'Total', value: report.total_sessions, color: 'text-gray-900 dark:text-white' },
                                { label: 'Attended', value: report.attended_sessions, color: 'text-green-600 dark:text-green-400' },
                                { label: 'Absent', value: report.absent_sessions, color: 'text-red-600 dark:text-red-400' },
                                { label: 'Late', value: report.late_sessions, color: 'text-yellow-600 dark:text-yellow-400' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className={`h-2 rounded-full ${attendanceRate >= 80 ? 'bg-green-500' : attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${attendanceRate}%` }}
                            />
                        </div>
                        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                            {attendanceRate}% attendance rate
                        </p>
                    </div>

                    {/* Text sections */}
                    {[
                        { label: 'Strengths', value: report.strengths },
                        { label: 'Areas for Improvement', value: report.areas_for_improvement },
                        { label: 'Tutor Comments', value: report.tutor_comments },
                        { label: 'Recommended Actions', value: report.recommended_actions },
                    ].map(({ label, value }) =>
                        value ? (
                            <div
                                key={label}
                                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                                <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                    {label}
                                </h2>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    {value}
                                </p>
                            </div>
                        ) : null
                    )}

                    {/* Published status */}
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                        {report.is_published ? (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ✓ Published to student on {formatDate(report.published_at)}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Draft — not yet visible to student
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
