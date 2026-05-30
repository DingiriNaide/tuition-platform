// resources/js/pages/ProgressReports/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { show, edit } from '@/actions/App/Http/Controllers/ProgressReportController';

interface Report {
    id: number;
    overall_grade: string | null;
    score: number | null;
    period_start: string;
    period_end: string;
    is_published: boolean;
    attended_sessions: number;
    total_sessions: number;
    student_profile: { full_name: string };
    course: { title: string; subject: { name: string } };
}

interface Props {
    reports: {
        data: Report[];
        total: number;
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    gradeOptions: Record<string, string>;
    gradeColors: Record<string, string>;
}

const colorClasses: Record<string, string> = {
    green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ProgressReportsIndex({
    reports,
    gradeOptions,
    gradeColors,
}: Props) {
    return (
        <AppLayout>
            <Head title="Progress Reports" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Progress Reports
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {reports.total} report{reports.total !== 1 ? 's' : ''}
                    </p>
                </div>

                {reports.data.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">
                            No reports yet. Create one from a booking's detail page.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.data.map((report) => {
                            const color = report.overall_grade
                                ? gradeColors[report.overall_grade]
                                : 'gray';
                            const rate = report.total_sessions > 0
                                ? Math.round((report.attended_sessions / report.total_sessions) * 100)
                                : 0;

                            return (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            {report.overall_grade && (
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses[color] ?? ''}`}>
                                                    {gradeOptions[report.overall_grade]}
                                                </span>
                                            )}
                                            {!report.is_published && (
                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {report.student_profile.full_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {report.course.title} · {report.course.subject.name}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            {formatDate(report.period_start)} → {formatDate(report.period_end)} ·{' '}
                                            {report.attended_sessions}/{report.total_sessions} sessions ·{' '}
                                            {rate}% attendance
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Link
                                            href={edit.url(report.id)}
                                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={show.url(report.id)}
                                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {reports.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-1">
                        {reports.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
