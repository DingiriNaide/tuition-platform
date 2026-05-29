// resources/js/pages/Courses/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { index, create, show } from '@/actions/App/Http/Controllers/CourseController';

// ── Types ─────────────────────────────────────────────────────────────

interface Subject {
    id: number;
    name: string;
    name_sinhala: string | null;
    name_tamil: string | null;
    syllabus: string;
}

interface TutorProfile {
    id: number;
    full_name: string;
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    grade: string;
    syllabus: string;
    medium: string;
    price_per_session: string | null;
    price_monthly: string | null;
    max_students: number;
    is_group: boolean;
    is_active: boolean;
    tutor_profile: TutorProfile;
    subject: Subject;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CoursesPage {
    data: Course[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    links: PaginationLink[];
}

interface Props {
    courses: CoursesPage;
    subjects: Subject[];
    filters: Record<string, string>;
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
}

// ── Page component ────────────────────────────────────────────────────

export default function CoursesIndex({
    courses,
    subjects,
    filters,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
}: Props) {
    const { auth } = usePage<{
        auth: { user: { roles: string[] } | null };
    }>().props;

    const isTutor = auth?.user?.roles?.includes('tutor') ?? false;
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(key: string, value: string): void {
        router.get(
            index.url(),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );
    }

    function submitSearch(e: React.FormEvent): void {
        e.preventDefault();
        applyFilter('search', search);
    }

    function clearFilters(): void {
        setSearch('');
        router.get(index.url(), {}, { preserveState: false, replace: true });
    }

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout>
            <Head title="Courses" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Available Courses
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {courses.total} course{courses.total !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    {isTutor && (
                        <Link
                            href={create.url()}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            + New Course
                        </Link>
                    )}
                </div>

                {/* ── Filters ── */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <form onSubmit={submitSearch} className="flex flex-wrap gap-3">

                        {/* Search */}
                        <div className="flex min-w-[200px] flex-1 items-center gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search courses..."
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Search
                            </button>
                        </div>

                        {/* Syllabus */}
                        <select
                            value={filters.syllabus ?? ''}
                            onChange={(e) => applyFilter('syllabus', e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Syllabi</option>
                            {Object.entries(syllabusOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>

                        {/* Medium */}
                        <select
                            value={filters.medium ?? ''}
                            onChange={(e) => applyFilter('medium', e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Mediums</option>
                            {Object.entries(mediumOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>

                        {/* Grade */}
                        <select
                            value={filters.grade ?? ''}
                            onChange={(e) => applyFilter('grade', e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Grades</option>
                            {Object.entries(gradeOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>

                        {/* Subject */}
                        <select
                            value={filters.subject_id ?? ''}
                            onChange={(e) => applyFilter('subject_id', e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>

                        {/* Clear */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* ── Grid ── */}
                {courses.data.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">No courses found.</p>
                        {isTutor && (
                            <Link
                                href={create.url()}
                                className="mt-3 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                Create the first course →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.data.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                gradeOptions={gradeOptions}
                                syllabusOptions={syllabusOptions}
                                mediumOptions={mediumOptions}
                            />
                        ))}
                    </div>
                )}

                {/* ── Pagination ── */}
                {courses.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-1">
                        {courses.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.get(link.url, {}, { preserveState: true })
                                }
                                className={[
                                    'rounded border px-3 py-1 text-sm',
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// ── Course Card ───────────────────────────────────────────────────────
// Defined in same file — no require(), imports are at module top level.

function CourseCard({
    course,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
}: {
    course: Course;
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
}) {
    return (
        <Link
            href={show.url(course.id)}
            className="group flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {course.subject.name}
                </span>
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {syllabusOptions[course.syllabus] ?? course.syllabus}
                </span>
            </div>

            {/* Title */}
            <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                {course.title}
            </h3>

            {/* Tutor */}
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                by {course.tutor_profile.full_name}
            </p>

            {/* Meta */}
            <div className="mt-auto flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    {gradeOptions[course.grade] ?? course.grade}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    {mediumOptions[course.medium] ?? course.medium}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    {course.is_group ? `Group · max ${course.max_students}` : 'Private'}
                </span>
            </div>

            {/* Price */}
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                {course.price_per_session && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        LKR {Number(course.price_per_session).toLocaleString('en-LK')}
                        <span className="ml-1 text-xs font-normal text-gray-500">/ session</span>
                    </p>
                )}
                {course.price_monthly && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        LKR {Number(course.price_monthly).toLocaleString('en-LK')}
                        <span className="ml-1 text-xs font-normal text-gray-500">/ month</span>
                    </p>
                )}
                {!course.price_per_session && !course.price_monthly && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Contact for pricing</p>
                )}
            </div>
        </Link>
    );
}