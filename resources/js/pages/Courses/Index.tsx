import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { index, create, show } from '@/actions/App/Http/Controllers/CourseController';
import EmptyState from '@/components/empty-state';
import { BookOpen, ChevronLeft, ChevronRight as ChevronRightIcon, Star } from 'lucide-react';

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
    thumbnail_url: string | null;
    reviews_avg_rating: string | null;
    reviews_count: number;
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
    featured: Course[];
    subjects: Subject[];
    filters: Record<string, string>;
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
    showingMine: boolean;
    canFilterMine: boolean;
}

// ── Page component ────────────────────────────────────────────────────

export default function CoursesIndex({
    courses,
    featured,
    subjects,
    filters,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
    showingMine,
    canFilterMine
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
        <>
            <Head title="Courses" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                            + New Course
                        </Link>
                    )}
                </div>

                {canFilterMine && (
                    <div className="mb-4 inline-flex rounded-xl border border-gray-200 p-1">
                        <button
                            onClick={() => router.get(index.url(), { ...filters }, { preserveState: true })}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                                !showingMine ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            All Courses
                        </button>
                        <button
                            onClick={() => router.get(index.url(), { ...filters, mine: 1 }, { preserveState: true })}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                                showingMine ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            My Courses
                        </button>
                    </div>
                )}

                {featured.length > 0 && (
                    <FeaturedCarousel featured={featured} syllabusOptions={syllabusOptions} />
                )}

                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <form onSubmit={submitSearch} className="flex flex-wrap gap-3">
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
                                className="px-3 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
                            >
                                Search
                            </button>
                        </div>

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

                {courses.data.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No courses found"
                        description={
                            isTutor
                                ? "You haven't created any courses yet. Create your first course to start offering sessions."
                                : "No courses match your search or filter criteria. Try adjusting your filters or search terms."
                        }
                        action={
                            isTutor
                                ? { label: 'Create First Course', href: create.url() }
                                : undefined
                        }
                    />
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
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ── Course Card ───────────────────────────────────────────────────────

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
            className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
            {course.thumbnail_url ? (
                <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-36 w-full object-cover"
                />
            ) : (
                <div className="h-36 w-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
            )}

            <div className="bg-emerald-50 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        {course.subject.name}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {syllabusOptions[course.syllabus] ?? course.syllabus}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {course.title}
                </h3>
            </div>

            <div className="px-5 py-4 flex flex-col flex-1">
                <p className="text-sm text-gray-500 mb-3">by {course.tutor_profile.full_name}</p>

                <div className="flex gap-2 flex-wrap mb-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {gradeOptions[course.grade] ?? course.grade}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {mediumOptions[course.medium] ?? course.medium}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {course.is_group ? `Group · max ${course.max_students}` : '1-on-1'}
                    </span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                    {course.price_per_session && (
                        <p className="font-bold text-emerald-700">
                            LKR {Number(course.price_per_session).toLocaleString('en-LK')}
                            <span className="text-xs font-normal text-gray-400 ml-1">/session</span>
                        </p>
                    )}
                    {course.price_monthly && (
                        <p className="text-sm text-gray-500">
                            LKR {Number(course.price_monthly).toLocaleString('en-LK')}
                            <span className="text-xs ml-1">/month</span>
                        </p>
                    )}
                    {!course.price_per_session && !course.price_monthly && (
                        <p className="text-xs text-gray-400">Contact for pricing</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ── Featured Carousel ────────────────────────────────────────────────

function FeaturedCarousel({
    featured,
    syllabusOptions,
}: {
    featured: Course[];
    syllabusOptions: Record<string, string>;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scroll(direction: 'left' | 'right'): void {
        scrollRef.current?.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }

    return (
        <div className="mb-10 -mx-4 sm:-mx-6 lg:-mx-8 rounded-2xl bg-gradient-to-br from-[#e8dcc4] to-[#faf6ee] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-emerald-900">Featured Courses</h2>
                    <p className="text-sm text-amber-700">Top-rated tutors on Ulama</p>
                </div>
                {featured.length > 3 && (
                    <div className="hidden gap-2 sm:flex">
                        <button
                            onClick={() => scroll('left')}
                            className="rounded-full bg-white p-2 text-emerald-800 shadow-sm hover:bg-emerald-50"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="rounded-full bg-white p-2 text-emerald-800 shadow-sm hover:bg-emerald-50"
                        >
                            <ChevronRightIcon className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {featured.map((course) => (
                    <FeaturedCourseCard key={course.id} course={course} syllabusOptions={syllabusOptions} />
                ))}
            </div>
        </div>
    );
}

function FeaturedCourseCard({
    course,
    syllabusOptions,
}: {
    course: Course;
    syllabusOptions: Record<string, string>;
}) {
    return (
        <Link
            href={show.url(course.id)}
            className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-100 transition-shadow hover:shadow-md"
        >
            <div className="relative h-40 w-full overflow-hidden">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-700 to-emerald-900" />
                )}
                <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-sm">
                    Featured
                </span>
                {course.reviews_avg_rating && Number(course.reviews_count) > 0 && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {Number(course.reviews_avg_rating).toFixed(1)}
                        <span className="font-normal text-white/70">({course.reviews_count})</span>
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2 px-4 py-3.5">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {course.subject.name} · {syllabusOptions[course.syllabus] ?? course.syllabus}
                </span>
                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">
                    {course.title}
                </h3>
                <div className="mt-1 flex items-center justify-between border-t border-amber-50 pt-2.5">
                    <p className="text-xs text-gray-500">by {course.tutor_profile.full_name}</p>
                    {course.price_per_session && (
                        <p className="text-sm font-bold text-emerald-700">
                            LKR {Number(course.price_per_session).toLocaleString('en-LK')}
                            <span className="text-xs font-normal text-gray-400">/session</span>
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}