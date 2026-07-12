import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { update, show } from '@/actions/App/Http/Controllers/CourseController';

// ── Types ─────────────────────────────────────────────────────────────

interface Subject {
    id: number;
    name: string;
    name_sinhala: string | null;
    name_tamil: string | null;
    syllabus: string;
}

interface Course {
    id: number;
    subject_id: number;
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
}

interface Props {
    course: Course;
    subjects: Subject[];
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
}

interface CourseForm {
    subject_id: string;
    title: string;
    title_sinhala: string;
    title_tamil: string;
    description: string;
    description_sinhala: string;
    description_tamil: string;
    grade: string;
    syllabus: string;
    medium: string;
    price_per_session: string;
    price_monthly: string;
    max_students: string;
    is_group: boolean;
    is_active: boolean;
}

// ── Component ─────────────────────────────────────────────────────────

export default function CourseEdit({
    course,
    subjects,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
}: Props) {
    const { data, setData, put, processing, errors } = useForm<CourseForm>({
        subject_id:           String(course.subject_id),
        title:                course.title,
        title_sinhala:        course.title_sinhala ?? '',
        title_tamil:          course.title_tamil ?? '',
        description:          course.description ?? '',
        description_sinhala:  course.description_sinhala ?? '',
        description_tamil:    course.description_tamil ?? '',
        grade:                course.grade,
        syllabus:             course.syllabus,
        medium:               course.medium,
        price_per_session:    course.price_per_session ?? '',
        price_monthly:        course.price_monthly ?? '',
        max_students:         String(course.max_students),
        is_group:             course.is_group,
        is_active:            course.is_active,
    });

    function submit(e: React.FormEvent): void {
        e.preventDefault();
        put(update.url(course.id));
    }

    return (
        <>
            <Head title={`Edit — ${course.title}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
                    <a
                        href={show.url(course.id)}
                        className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        ← Back to course
                    </a>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <FormCard title="Course Details">
                        <Field label="Subject" error={errors.subject_id} required>
                            <select
                                value={data.subject_id}
                                onChange={(e) => setData('subject_id', e.target.value)}
                                className={selectClass(!!errors.subject_id)}
                            >
                                <option value="">Select subject</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}{s.name_sinhala ? ` · ${s.name_sinhala}` : ''}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Title (English)" error={errors.title} required>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={inputClass(!!errors.title)}
                            />
                        </Field>

                        <Field label="Title (Sinhala)" error={errors.title_sinhala}>
                            <input
                                type="text"
                                value={data.title_sinhala}
                                onChange={(e) => setData('title_sinhala', e.target.value)}
                                className={inputClass(!!errors.title_sinhala)}
                            />
                        </Field>

                        <Field label="Title (Tamil)" error={errors.title_tamil}>
                            <input
                                type="text"
                                value={data.title_tamil}
                                onChange={(e) => setData('title_tamil', e.target.value)}
                                className={inputClass(!!errors.title_tamil)}
                            />
                        </Field>

                        <Field label="Description (English)" error={errors.description}>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={inputClass(!!errors.description)}
                            />
                        </Field>

                        <Field label="Description (Sinhala)" error={errors.description_sinhala}>
                            <textarea
                                value={data.description_sinhala}
                                onChange={(e) => setData('description_sinhala', e.target.value)}
                                rows={3}
                                className={inputClass(!!errors.description_sinhala)}
                            />
                        </Field>

                        <Field label="Description (Tamil)" error={errors.description_tamil}>
                            <textarea
                                value={data.description_tamil}
                                onChange={(e) => setData('description_tamil', e.target.value)}
                                rows={3}
                                className={inputClass(!!errors.description_tamil)}
                            />
                        </Field>
                    </FormCard>

                    <FormCard title="Academic Details">
                        <Field label="Grade" error={errors.grade} required>
                            <select
                                value={data.grade}
                                onChange={(e) => setData('grade', e.target.value)}
                                className={selectClass(!!errors.grade)}
                            >
                                <option value="">Select grade</option>
                                {Object.entries(gradeOptions).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Syllabus" error={errors.syllabus} required>
                            <select
                                value={data.syllabus}
                                onChange={(e) => setData('syllabus', e.target.value)}
                                className={selectClass(!!errors.syllabus)}
                            >
                                <option value="">Select syllabus</option>
                                {Object.entries(syllabusOptions).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Teaching Medium" error={errors.medium} required>
                            <select
                                value={data.medium}
                                onChange={(e) => setData('medium', e.target.value)}
                                className={selectClass(!!errors.medium)}
                            >
                                <option value="">Select medium</option>
                                {Object.entries(mediumOptions).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>
                    </FormCard>

                    <FormCard title="Pricing & Capacity">
                        <Field label="Price per Session (LKR)" error={errors.price_per_session}>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                    LKR
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price_per_session}
                                    onChange={(e) => setData('price_per_session', e.target.value)}
                                    className={`${inputClass(!!errors.price_per_session)} pl-12`}
                                />
                            </div>
                        </Field>

                        <Field label="Monthly Price (LKR)" error={errors.price_monthly}>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                    LKR
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price_monthly}
                                    onChange={(e) => setData('price_monthly', e.target.value)}
                                    className={`${inputClass(!!errors.price_monthly)} pl-12`}
                                />
                            </div>
                        </Field>

                        <Field label="Maximum Students" error={errors.max_students} required>
                            <input
                                type="number"
                                min="1"
                                max="500"
                                value={data.max_students}
                                onChange={(e) => setData('max_students', e.target.value)}
                                className={inputClass(!!errors.max_students)}
                            />
                        </Field>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_group}
                                    onChange={(e) => setData('is_group', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
                            </label>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {data.is_group ? 'Group class' : 'Private / 1-on-1 class'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
                            </label>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {data.is_active ? 'Course is active' : 'Course is inactive'}
                            </span>
                        </div>
                    </FormCard>

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ── Reuse same utility functions from Create.tsx ──────────────────────
// (In a real project extract to @/components/form-helpers.tsx)

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
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
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function inputClass(hasError: boolean): string {
    return [
        'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2',
        hasError
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
    ].join(' ');
}

function selectClass(hasError: boolean): string {
    return inputClass(hasError);
}