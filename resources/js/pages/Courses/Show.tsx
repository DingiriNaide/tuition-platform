import { Head, Link, router, usePage } from '@inertiajs/react';
import { edit, destroy, index } from '@/actions/App/Http/Controllers/CourseController';
import { create as createBooking } from '@/actions/App/Http/Controllers/BookingController';
import { index as viewAssignment } from '@/actions/App/Http/Controllers/AssignmentController';
import { useState } from 'react';
import { Star } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────

interface Course {
    id: number;
    title: string;
    title_sinhala: string | null;
    title_tamil: string | null;
    description: string | null;
    description_sinhala: string | null;
    description_tamil: string | null;
    grade: string;
    syllabus: string;
    medium: string;
    price_per_session: string | null;
    price_monthly: string | null;
    max_students: number;
    is_group: boolean;
    is_active: boolean;
    tutor_profile: {
        id: number;
        full_name: string;
        city: string;
        district: string;
        rating: string | null;
        total_reviews: number;
        user_id: number;
    };
    subject: {
        id: number;
        name: string;
        name_sinhala: string | null;
        name_tamil: string | null;
    };
}

interface Props {
    course: Course;
    canManage: boolean;
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
}

interface AuthUser {
    id: number;
    roles: string[];
}

// ── Component ─────────────────────────────────────────────────────────

export default function CourseShow({
    course,
    canManage,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
}: Props) {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;

    const isStudent = auth.user?.roles?.includes('student') ?? false;

    function handleDelete(): void {
        if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
        router.delete(destroy.url(course.id), {
            onSuccess: () => router.visit(index.url()),
        });
    }

    return (
        <>
            <Head title={course.title} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Breadcrumb ── */}
                <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <Link
                        href={index.url()}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        Courses
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">{course.title}</span>
                </nav>

                {/* ── Header ── */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                            <Badge color="indigo">{course.subject.name}</Badge>
                            <Badge color="blue">
                                {syllabusOptions[course.syllabus] ?? course.syllabus}
                            </Badge>
                            <Badge color="purple">
                                {mediumOptions[course.medium] ?? course.medium}
                            </Badge>
                            {!course.is_active && <Badge color="red">Inactive</Badge>}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {course.title}
                        </h1>
                        {course.title_sinhala && (
                            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                                {course.title_sinhala}
                            </p>
                        )}
                        {course.title_tamil && (
                            <p className="text-base text-gray-500 dark:text-gray-400">
                                {course.title_tamil}
                            </p>
                        )}
                    </div>

                    {/* Owner actions */}
                    {canManage && (
                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                href={edit.url(course.id)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── Main column ── */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Description */}
                        {(course.description ||
                            course.description_sinhala ||
                            course.description_tamil) && (
                            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                    About this Course
                                </h2>
                                {course.description && (
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        {course.description}
                                    </p>
                                )}
                                {course.description_sinhala && (
                                    <>
                                        <hr className="my-4 border-gray-100 dark:border-gray-700" />
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                            {course.description_sinhala}
                                        </p>
                                    </>
                                )}
                                {course.description_tamil && (
                                    <>
                                        <hr className="my-4 border-gray-100 dark:border-gray-700" />
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                            {course.description_tamil}
                                        </p>
                                    </>
                                )}
                            </section>
                        )}

                        {/* Details grid */}
                        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                                Course Details
                            </h2>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DetailItem
                                    label="Grade"
                                    value={gradeOptions[course.grade] ?? course.grade}
                                />
                                <DetailItem
                                    label="Syllabus"
                                    value={syllabusOptions[course.syllabus] ?? course.syllabus}
                                />
                                <DetailItem
                                    label="Medium"
                                    value={mediumOptions[course.medium] ?? course.medium}
                                />
                                <DetailItem
                                    label="Class Type"
                                    value={
                                        course.is_group
                                            ? `Group (max ${course.max_students} students)`
                                            : 'Private / 1-on-1'
                                    }
                                />
                                <DetailItem
                                    label="Subject"
                                    value={course.subject.name}
                                />
                                {course.subject.name_sinhala && (
                                    <DetailItem
                                        label="Subject (සිංහල)"
                                        value={course.subject.name_sinhala}
                                    />
                                )}
                                {course.subject.name_tamil && (
                                    <DetailItem
                                        label="Subject (தமிழ்)"
                                        value={course.subject.name_tamil}
                                    />
                                )}
                                <DetailItem
                                    label="Status"
                                    value={course.is_active ? 'Active' : 'Inactive'}
                                />
                            </dl>
                        </section>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4">

                        {/* Pricing + booking CTA */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                Pricing
                            </h2>

                            {course.price_per_session && (
                                <div className="mb-2">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        LKR{' '}
                                        {Number(course.price_per_session).toLocaleString('en-LK')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        per session
                                    </p>
                                </div>
                            )}

                            {course.price_monthly && (
                                <div className="mb-2">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        LKR{' '}
                                        {Number(course.price_monthly).toLocaleString('en-LK')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        per month
                                    </p>
                                </div>
                            )}

                            {!course.price_per_session && !course.price_monthly && (
                                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                    Contact tutor for pricing
                                </p>
                            )}

                            {/* ── Booking button — behaviour depends on who is viewing ── */}
                            {isStudent ? (
                                // Student: link to booking form pre-filled with this course
                                <Link
                                    href={`${createBooking.url()}?course_id=${course.id}`}
                                    className="mt-4 block w-full rounded-md bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Book a Session
                                </Link>
                            ) : canManage ? (
                                // Tutor/admin who owns the course: no booking, show edit shortcut
                                <Link
                                    href={edit.url(course.id)}
                                    className="mt-4 block w-full rounded-md border border-indigo-300 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                >
                                    Edit Course
                                </Link>
                            ) : auth.user ? (
                                // Logged in but wrong role (e.g. parent)
                                <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                                    A student account is required to book this course.
                                </p>
                            ) : (
                                // Guest
                                <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                                    Sign in as a student to book this course.
                                </p>
                            )}
                        </div>

                        {/* Tutor info */}
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                                Tutor
                            </h2>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {course.tutor_profile.full_name}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                {course.tutor_profile.city}, {course.tutor_profile.district}
                            </p>
                            {course.tutor_profile.rating && (
                                <p className="mt-2 flex items-center gap-1 text-sm">
                                    <Star className="size-4 text-amber-400 fill-amber-400" />
                                    <span className="font-semibold text-gray-900">
                                        {Number(course.tutor_profile.rating).toFixed(1)}
                                    </span>
                                    <span className="text-gray-500">
                                        ({course.tutor_profile.total_reviews} reviews)
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Tutor/admin manage panel in sidebar */}
                        {canManage && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                    Manage this course
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={viewAssignment.url(course.id)}
                                        className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-center text-sm font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                                    >
                                        Assignments
                                    </Link>
                                    <Link
                                        href={edit.url(course.id)}
                                        className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-center text-sm font-medium text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-900/40"
                                    >
                                        Edit Course
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        Delete Course
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Sub-components ────────────────────────────────────────────────────

function Badge({
    color,
    children,
}: {
    color: 'indigo' | 'blue' | 'purple' | 'red' | 'green';
    children: React.ReactNode;
}) {
    const palettes: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        red:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${palettes[color]}`}>
            {children}
        </span>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
        </div>
    );
}
