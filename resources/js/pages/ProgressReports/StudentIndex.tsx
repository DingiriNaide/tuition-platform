import { Head, Link, router } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ProgressReportController';
import EmptyState from '@/components/empty-state';
import { BarChart2 } from 'lucide-react';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';
import { dashboard } from '@/routes';

interface Report {
    id: number;
    overall_grade: string | null;
    score: number | null;
    period_start: string;
    period_end: string;
    attended_sessions: number;
    total_sessions: number;
    course: { title: string; subject: { name: string } };
    tutor_profile: { full_name: string };
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

export default function StudentProgressReports({
    reports,
    gradeOptions,
    gradeColors,
}: Props) {
    return (
        <>
            <Head title="My Progress Reports" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    My Progress Reports
                </h1>

                {reports.data.length === 0 ? (
                    <EmptyState
                        icon={BarChart2}
                        title="No published reports yet"
                        description="Your Tutor have not published any reports yet. Your tutor will share progress reports here."
                        action={{ label: 'Go Home', href: dashboard.url() }}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {reports.data.map((report) => {
                            const color = report.overall_grade
                                ? gradeColors[report.overall_grade] ?? 'gray'
                                : 'gray';
                            const rate = report.total_sessions > 0
                                ? Math.round((report.attended_sessions / report.total_sessions) * 100)
                                : 0;

                            return (
                                <Link
                                    key={report.id}
                                    href={show.url(report.id)}
                                    className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        {report.overall_grade ? (
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses[color]}`}>
                                                {gradeOptions[report.overall_grade]}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        {report.score !== null && (
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {report.score}/100
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                        {report.course.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {report.course.subject.name} · {report.tutor_profile.full_name}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {formatDate(report.period_start)} → {formatDate(report.period_end)}
                                    </p>
                                    <div className="mt-3">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">
                                            {rate}% attendance
                                        </p>
                                    </div>
                                </Link>
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
        </>
    );
}
